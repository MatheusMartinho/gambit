const B3Scraper = require('./sources/B3Scraper');
const CVMClient = require('./sources/CVMClient');
const YahooFinanceClient = require('./sources/YahooFinanceClient');
const FundamentusClient = require('./sources/FundamentusClient');
const StatusInvestClient = require('./sources/StatusInvestClient');
const logger = require('../utils/logger');
const CacheManager = require('../cache/cacheManager');

/**
 * Data Aggregator - Agrega dados de múltiplas fontes
 */
class DataAggregator {
  constructor() {
    this.sources = {
      b3: new B3Scraper(),
      cvm: new CVMClient(),
      yahoo: new YahooFinanceClient(),
      fundamentus: new FundamentusClient(),
      statusInvest: new StatusInvestClient()
    };
  }

  /**
   * Busca dados completos de uma ação de TODAS as fontes
   */
  async collectStockData(ticker) {
    logger.info(`Agregando dados para ${ticker}`);

    try {
      // Verificar cache primeiro
      const cacheKey = `aggregated:${ticker}`;
      const cached = await CacheManager.get(cacheKey);
      
      if (cached) {
        logger.info(`Cache hit para agregação de ${ticker}`);
        return cached;
      }

      // Buscar dados em paralelo de todas as fontes
      const results = await Promise.allSettled([
        this.sources.b3.getStockData(ticker),
        this.sources.cvm.getFinancialStatements(ticker),
        this.sources.yahoo.getQuoteAndChart(ticker),
        this.sources.fundamentus.getIndicators(ticker),
        this.sources.statusInvest.getCompanyInfo(ticker)
      ]);

      // Processar resultados
      const [b3Data, cvmData, yahooData, fundamentusData, statusInvestData] = 
        results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            logger.warn(`Fonte falhou:`, result.reason?.message);
            return null;
          }
        });

      // Mesclar e normalizar dados
      const aggregatedData = this.mergeData({
        b3: b3Data,
        cvm: cvmData,
        yahoo: yahooData,
        fundamentus: fundamentusData,
        statusInvest: statusInvestData
      });

      // Cachear resultado (1 hora)
      await CacheManager.set(cacheKey, aggregatedData, 3600);

      return aggregatedData;

    } catch (error) {
      logger.error(`Erro ao agregar dados de ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Mescla dados de múltiplas fontes em um único objeto normalizado
   */
  mergeData(sources) {
    const { b3, cvm, yahoo, fundamentus, statusInvest } = sources;

    return {
      company: this.mergeCompanyInfo(b3, cvm, statusInvest),
      quote: this.mergeQuoteData(yahoo, b3, statusInvest),
      intraday_chart: yahoo?.chart || [],
      key_metrics: this.mergeKeyMetrics(fundamentus, statusInvest, cvm),
      financials: this.mergeFinancialStatements(cvm, statusInvest),
      dividends: this.mergeDividendData(b3, statusInvest),
      peers: this.identifyPeers(statusInvest, fundamentus),
      _sources: this.getSourcesUsed(sources)
    };
  }

  /**
   * Mescla informações da empresa
   */
  mergeCompanyInfo(b3, cvm, statusInvest) {
    return {
      ticker: b3?.ticker || statusInvest?.ticker,
      name: cvm?.razao_social || b3?.name || statusInvest?.name,
      cnpj: cvm?.cnpj || b3?.cnpj,
      description: statusInvest?.description || b3?.description || 'Descrição não disponível',
      sector: this.normalizeSector(
        statusInvest?.sector || b3?.sector || cvm?.setor
      ),
      industry: statusInvest?.industry || b3?.industry,
      website: statusInvest?.website || b3?.website,
      logo_url: this.getLogoUrl(b3?.ticker || statusInvest?.ticker),
      listing_segment: b3?.segment || 'Não disponível',
      indexes: b3?.indexes || [],
      headquarters: this.formatHeadquarters(cvm?.endereco || statusInvest?.address)
    };
  }

  /**
   * Mescla dados de cotação
   */
  mergeQuoteData(yahoo, b3, statusInvest) {
    // Prioridade: Yahoo > StatusInvest > B3
    const price = yahoo?.price || statusInvest?.price || b3?.price || 0;
    const previousClose = yahoo?.previousClose || statusInvest?.previousClose || price;
    
    return {
      price: parseFloat(price),
      change: parseFloat(price - previousClose),
      change_percent: previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0,
      currency: 'BRL',
      volume: yahoo?.volume || statusInvest?.volume || 0,
      avg_volume_30d: statusInvest?.avgVolume30d || yahoo?.avgVolume || 0,
      market_cap: this.calculateMarketCap(price, statusInvest?.sharesOutstanding),
      shares_outstanding: statusInvest?.sharesOutstanding || 0,
      open: yahoo?.open || statusInvest?.open || price,
      high: yahoo?.high || statusInvest?.high || price,
      low: yahoo?.low || statusInvest?.low || price,
      previous_close: previousClose,
      last_updated: new Date().toISOString(),
      market_status: this.getMarketStatus(),
      beta: statusInvest?.beta || 1.0
    };
  }

  /**
   * Mescla métricas-chave
   */
  mergeKeyMetrics(fundamentus, statusInvest, cvm) {
    return {
      // Múltiplos de Valuation
      pe_ratio: this.getFirstValid(
        fundamentus?.pl, 
        statusInvest?.pe
      ),
      pb_ratio: this.getFirstValid(
        fundamentus?.pvp, 
        statusInvest?.pb
      ),
      ps_ratio: fundamentus?.psr || statusInvest?.ps,
      pcf_ratio: fundamentus?.pcf || statusInvest?.pcf,
      ev_ebitda: fundamentus?.evebitda || statusInvest?.evEbitda,
      peg_ratio: statusInvest?.peg || 1.45,
      
      // Rentabilidade
      roe: this.getFirstValid(
        fundamentus?.roe, 
        statusInvest?.roe
      ) * 100 || 0,
      roa: (fundamentus?.roa || statusInvest?.roa || 0) * 100,
      roic: (fundamentus?.roic || statusInvest?.roic || 0) * 100,
      roce: statusInvest?.roce * 100 || 0,
      
      // Margens
      gross_margin: (statusInvest?.grossMargin || 0) * 100,
      ebitda_margin: this.getFirstValid(
        fundamentus?.margebitda,
        statusInvest?.ebitdaMargin
      ) * 100 || 0,
      operating_margin: (statusInvest?.operatingMargin || 0) * 100,
      net_margin: this.getFirstValid(
        fundamentus?.margliq,
        statusInvest?.netMargin
      ) * 100 || 0,
      
      // Endividamento
      debt_to_equity: fundamentus?.divbpatr || statusInvest?.debtToEquity || 0,
      debt_to_ebitda: this.calculateDebtToEBITDA(fundamentus, statusInvest),
      current_ratio: fundamentus?.liqcorr || statusInvest?.currentRatio || 0,
      quick_ratio: statusInvest?.quickRatio || 0,
      
      // Dividendos
      dividend_yield: (fundamentus?.dy || statusInvest?.dividendYield || 0) * 100,
      payout_ratio: (statusInvest?.payoutRatio || 0) * 100,
      
      // Crescimento
      revenue_cagr_5y: (statusInvest?.revenueCagr5y || fundamentus?.cresrec5a || 0) * 100,
      earnings_cagr_5y: (statusInvest?.earningsCagr5y || 0) * 100,
      fcf_growth_rate: (statusInvest?.fcfGrowth || 0) * 100,
      
      // Outros
      free_float: (statusInvest?.freeFloat || 0) * 100,
      lpa: fundamentus?.lpa || statusInvest?.eps || 0,
      vpa: fundamentus?.vpa || statusInvest?.bookValuePerShare || 0,
      
      // Dados para cálculos
      total_debt: statusInvest?.totalDebt || 0,
      cash: statusInvest?.cash || 0,
      ebitda: statusInvest?.ebitda || 0,
      revenue: statusInvest?.revenue || 0,
      net_income: statusInvest?.netIncome || 0,
      operating_cash_flow: statusInvest?.operatingCashFlow || 0,
      free_cash_flow: statusInvest?.freeCashFlow || 0,
      capex: statusInvest?.capex || 0,
      current_assets: statusInvest?.currentAssets || 0,
      current_liabilities: statusInvest?.currentLiabilities || 0,
      total_assets: statusInvest?.totalAssets || 0,
      shareholders_equity: statusInvest?.equity || 0,
      
      // Qualidade
      piotroski_score: statusInvest?.piotroskiScore || 0,
      altman_z_score: statusInvest?.altmanZScore || 0,
      
      // WACC estimado
      wacc: 12.8
    };
  }

  /**
   * Mescla demonstrações financeiras
   */
  mergeFinancialStatements(cvm, statusInvest) {
    return {
      income_statement: {
        annual: this.normalizeIncomeStatement(
          cvm?.dre_anual || statusInvest?.incomeStatement?.annual || []
        ),
        quarterly: this.normalizeIncomeStatement(
          cvm?.dre_trimestral || statusInvest?.incomeStatement?.quarterly || []
        )
      },
      balance_sheet: {
        annual: this.normalizeBalanceSheet(
          cvm?.bp_anual || statusInvest?.balanceSheet?.annual || []
        ),
        quarterly: this.normalizeBalanceSheet(
          cvm?.bp_trimestral || statusInvest?.balanceSheet?.quarterly || []
        )
      },
      cash_flow: {
        annual: this.normalizeCashFlow(
          cvm?.dfc_anual || statusInvest?.cashFlow?.annual || []
        ),
        quarterly: this.normalizeCashFlow(
          cvm?.dfc_trimestral || statusInvest?.cashFlow?.quarterly || []
        )
      }
    };
  }

  /**
   * Mescla dados de dividendos
   */
  mergeDividendData(b3, statusInvest) {
    const dividends = statusInvest?.dividends || b3?.dividends || [];
    
    return {
      history: dividends.map(d => ({
        ex_date: d.exDate || d.dataCom,
        payment_date: d.paymentDate || d.dataPagamento,
        type: d.type || d.tipo || 'Dividendo',
        amount_per_share: parseFloat(d.value || d.valor || 0),
        price_on_ex_date: d.priceOnExDate || 0,
        yield: d.yield || 0
      })),
      summary: this.calculateDividendSummary(dividends)
    };
  }

  /**
   * Calcula resumo de dividendos
   */
  calculateDividendSummary(dividends) {
    const last12Months = dividends.filter(d => {
      const date = new Date(d.exDate || d.dataCom);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return date >= oneYearAgo;
    });

    const ttmDividends = last12Months.reduce((sum, d) => 
      sum + parseFloat(d.value || d.valor || 0), 0
    );

    return {
      ttm_dividends: ttmDividends,
      number_of_payments_12m: last12Months.length,
      average_yield_12m: last12Months.length > 0 
        ? last12Months.reduce((sum, d) => sum + (d.yield || 0), 0) / last12Months.length 
        : 0,
      consecutive_years: this.calculateConsecutiveYears(dividends),
      dividend_safety_score: this.calculateDividendSafety(dividends)
    };
  }

  /**
   * Identifica pares/concorrentes
   */
  identifyPeers(statusInvest, fundamentus) {
    // Retornar lista de tickers do mesmo setor
    // (implementar busca no banco ou cache)
    return [];
  }

  /**
   * Helpers
   */
  getFirstValid(...values) {
    return values.find(v => v !== null && v !== undefined && !isNaN(v) && v !== 0) || null;
  }

  normalizeSector(sector) {
    if (!sector) return 'Não disponível';
    
    const sectorMap = {
      'Mineração': 'Mineração',
      'Petróleo, Gás e Combustíveis': 'Petróleo e Gás',
      'Bancos': 'Financeiro',
      'Energia Elétrica': 'Energia',
      'Telecomunicações': 'Telecom',
      'Varejo': 'Varejo',
      'Construção Civil': 'Construção',
      'Siderurgia e Metalurgia': 'Siderurgia'
    };
    
    return sectorMap[sector] || sector;
  }

  getLogoUrl(ticker) {
    if (!ticker) return null;
    return `https://raw.githubusercontent.com/thefintz/b3-listed-companies/main/logos/${ticker}.png`;
  }

  calculateMarketCap(price, shares) {
    if (!price || !shares) return 0;
    return price * shares;
  }

  calculateDebtToEBITDA(fundamentus, statusInvest) {
    if (fundamentus?.divbruta && fundamentus?.ebitda) {
      return fundamentus.divbruta / fundamentus.ebitda;
    }
    if (statusInvest?.totalDebt && statusInvest?.ebitda) {
      return statusInvest.totalDebt / statusInvest.ebitda;
    }
    return 0;
  }

  getMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Mercado aberto de seg-sex, 10h-17h (horário de Brasília)
    if (day >= 1 && day <= 5 && hour >= 10 && hour < 17) {
      return 'open';
    }
    return 'closed';
  }

  getSourcesUsed(sources) {
    return Object.entries(sources)
      .filter(([_, value]) => value !== null)
      .map(([key, _]) => key);
  }

  normalizeIncomeStatement(data) {
    if (!Array.isArray(data)) return [];
    
    return data.map(period => ({
      year: period.ano || period.year,
      quarter: period.trimestre || period.quarter,
      revenue: parseFloat(period.receitaLiquida || period.revenue || 0),
      gross_profit: parseFloat(period.lucrobruto || period.grossProfit || 0),
      ebitda: parseFloat(period.ebitda || 0),
      operating_income: parseFloat(period.lucroOperacional || period.operatingIncome || 0),
      net_income: parseFloat(period.lucroLiquido || period.netIncome || 0),
      eps: parseFloat(period.lpa || period.eps || 0),
      shares_outstanding: parseFloat(period.acoes || period.shares || 0)
    }));
  }

  normalizeBalanceSheet(data) {
    if (!Array.isArray(data)) return [];
    
    return data.map(period => ({
      year: period.ano || period.year,
      quarter: period.trimestre || period.quarter,
      total_assets: parseFloat(period.ativoTotal || period.totalAssets || 0),
      current_assets: parseFloat(period.ativoCirculante || period.currentAssets || 0),
      cash: parseFloat(period.disponibilidades || period.cash || 0),
      total_liabilities: parseFloat(period.passivoTotal || period.totalLiabilities || 0),
      current_liabilities: parseFloat(period.passivoCirculante || period.currentLiabilities || 0),
      total_debt: parseFloat(period.dividaTotal || period.totalDebt || 0),
      shareholders_equity: parseFloat(period.patrimonioLiquido || period.equity || 0)
    }));
  }

  normalizeCashFlow(data) {
    if (!Array.isArray(data)) return [];
    
    return data.map(period => ({
      year: period.ano || period.year,
      quarter: period.trimestre || period.quarter,
      operating_cash_flow: parseFloat(period.fcOperacional || period.operatingCF || 0),
      capex: parseFloat(period.capex || 0),
      free_cash_flow: parseFloat(period.fcLivre || period.freeCashFlow || 0),
      dividends_paid: parseFloat(period.dividendos || period.dividendsPaid || 0),
      fcf_per_share: parseFloat(period.fcfPerShare || 0)
    }));
  }

  calculateConsecutiveYears(dividends) {
    if (!dividends || dividends.length === 0) return 0;
    
    // Agrupar por ano
    const yearlyDividends = {};
    dividends.forEach(d => {
      const year = new Date(d.exDate || d.dataCom).getFullYear();
      yearlyDividends[year] = true;
    });

    // Contar anos consecutivos
    const years = Object.keys(yearlyDividends).map(Number).sort((a, b) => b - a);
    let consecutive = 0;
    
    for (let i = 0; i < years.length; i++) {
      if (i === 0 || years[i] === years[i-1] - 1) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  }

  calculateDividendSafety(dividends) {
    // Score de 0-100 baseado em consistência e crescimento
    const consecutive = this.calculateConsecutiveYears(dividends);
    const baseScore = Math.min(consecutive * 10, 50);
    
    // Adicionar pontos por número de pagamentos
    const paymentsScore = Math.min(dividends.length * 2, 30);
    
    // Adicionar pontos por crescimento
    const growthScore = 20; // Simplificado
    
    return Math.min(baseScore + paymentsScore + growthScore, 100);
  }

  formatHeadquarters(address) {
    if (!address) return 'Não disponível';
    if (typeof address === 'string') return address;
    return `${address.cidade || ''}, ${address.uf || ''}, ${address.pais || 'Brasil'}`.trim();
  }
}

module.exports = new DataAggregator();
