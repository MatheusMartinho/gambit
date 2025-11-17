const yahooFinance = require('yahoo-finance2').default;
const NodeCache = require('node-cache');

// Cache com TTL de 15 minutos (900 segundos)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Mapeamento de tickers brasileiros para Yahoo Finance
const TICKER_MAP = {
  'VALE3': 'VALE3.SA',
  'PETR4': 'PETR4.SA',
  'ITUB4': 'ITUB4.SA',
  'BBDC4': 'BBDC4.SA',
  'ABEV3': 'ABEV3.SA',
  'WEGE3': 'WEGE3.SA',
  'BBAS3': 'BBAS3.SA',
  'RENT3': 'RENT3.SA',
  'GGBR4': 'GGBR4.SA',
  'SUZB3': 'SUZB3.SA'
};

// Converter ticker brasileiro para Yahoo
function toYahooTicker(ticker) {
  return TICKER_MAP[ticker] || `${ticker}.SA`;
}

// Buscar cotação atual
async function getQuote(ticker) {
  try {
    const yahooTicker = toYahooTicker(ticker);
    const quote = await yahooFinance.quote(yahooTicker);
    
    return {
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      change_percent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      market_cap: quote.marketCap || 0,
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      previous_close: quote.regularMarketPreviousClose || 0,
      fifty_two_week_high: quote.fiftyTwoWeekHigh || 0,
      fifty_two_week_low: quote.fiftyTwoWeekLow || 0,
      market_status: quote.marketState === 'REGULAR' ? 'open' : 'closed',
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar cotação de ${ticker}:`, error.message);
    return null;
  }
}

// Buscar histórico de preços
async function getHistoricalData(ticker, period = '1y', interval = '1d') {
  try {
    const yahooTicker = toYahooTicker(ticker);
    const queryOptions = { period1: getPeriodStart(period), interval };
    const result = await yahooFinance.historical(yahooTicker, queryOptions);
    
    return result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  } catch (error) {
    console.error(`❌ Erro ao buscar histórico de ${ticker}:`, error.message);
    return [];
  }
}

// Buscar dados fundamentalistas COMPLETOS
async function getFundamentals(ticker) {
  try {
    const yahooTicker = toYahooTicker(ticker);
    const modules = [
      'summaryDetail',
      'defaultKeyStatistics', 
      'financialData',
      'price',
      'balanceSheetHistory',
      'incomeStatementHistory',
      'cashflowStatementHistory'
    ];
    const result = await yahooFinance.quoteSummary(yahooTicker, { modules });
    
    const summary = result.summaryDetail || {};
    const keyStats = result.defaultKeyStatistics || {};
    const financial = result.financialData || {};
    const price = result.price || {};
    const cashflow = result.cashflowStatementHistory?.cashflowStatements || [];
    
    console.log(`\n📊 === YAHOO FINANCE DATA PARA ${ticker} ===`);
    console.log('Cashflow Statements disponíveis:', cashflow.length);
    
    // Extrair Free Cash Flow dos últimos 5 anos
    // Se freeCashflow não está disponível, calcular: Operating CF - CapEx
    const freeCashFlowHistory = cashflow
      .slice(0, 5)
      .map(statement => {
        let fcf = statement.freeCashflow;
        
        // Se FCF não está disponível, calcular manualmente
        if (!fcf || fcf === 0) {
          const operatingCF = statement.totalCashFromOperatingActivities || 0;
          const capEx = Math.abs(statement.capitalExpenditures || 0);
          fcf = operatingCF - capEx;
          console.log(`  Calculando FCF: ${operatingCF} - ${capEx} = ${fcf}`);
        }
        
        return {
          date: statement.endDate?.fmt || 'N/A',
          freeCashFlow: fcf || 0
        };
      })
      .reverse(); // Ordem cronológica (mais antigo primeiro)
    
    console.log('FCF History extraído:', freeCashFlowHistory);
    console.log('=== FIM YAHOO DATA ===\n');
    
    return {
      // Indicadores de Valuation
      pe_ratio: summary.trailingPE || keyStats.trailingPE || null,
      forward_pe: summary.forwardPE || null,
      pb_ratio: keyStats.priceToBook || null,
      peg_ratio: keyStats.pegRatio || null,
      price_to_sales: summary.priceToSalesTrailing12Months || null,
      ev_to_ebitda: keyStats.enterpriseToEbitda || null,
      ev_to_revenue: keyStats.enterpriseToRevenue || null,
      
      // Dividendos (USAR APENAS TRAILING - últimos 12 meses)
      dividend_yield: summary.trailingAnnualDividendYield ? summary.trailingAnnualDividendYield * 100 : 
                      (summary.dividendYield ? summary.dividendYield * 100 : 0),
      dividend_rate: summary.trailingAnnualDividendRate || summary.dividendRate || null,
      payout_ratio: keyStats.payoutRatio ? keyStats.payoutRatio * 100 : null,
      ex_dividend_date: summary.exDividendDate || null,
      
      // Rentabilidade
      roe: financial.returnOnEquity ? financial.returnOnEquity * 100 : null,
      roa: financial.returnOnAssets ? financial.returnOnAssets * 100 : null,
      roic: keyStats.returnOnCapital ? keyStats.returnOnCapital * 100 : null,
      
      // Margens
      profit_margin: financial.profitMargins ? financial.profitMargins * 100 : null,
      operating_margin: financial.operatingMargins ? financial.operatingMargins * 100 : null,
      gross_margin: financial.grossMargins ? financial.grossMargins * 100 : null,
      ebitda_margin: financial.ebitdaMargins ? financial.ebitdaMargins * 100 : null,
      
      // Crescimento
      revenue_growth: financial.revenueGrowth ? financial.revenueGrowth * 100 : null,
      earnings_growth: financial.earningsGrowth ? financial.earningsGrowth * 100 : null,
      
      // Balanço
      total_cash: financial.totalCash || null,
      total_debt: financial.totalDebt || null,
      debt_to_equity: financial.debtToEquity || null,
      current_ratio: financial.currentRatio || null,
      quick_ratio: financial.quickRatio || null,
      
      // Financeiro
      revenue: financial.totalRevenue || null,
      ebitda: financial.ebitda || null,
      net_income: keyStats.netIncomeToCommon || null,
      free_cash_flow: financial.freeCashflow || null,
      operating_cash_flow: financial.operatingCashflow || null,
      
      // Outros
      enterprise_value: keyStats.enterpriseValue || null,
      shares_outstanding: keyStats.sharesOutstanding || null,
      float_shares: keyStats.floatShares || null,
      beta: summary.beta || null,
      trailing_eps: keyStats.trailingEps || null,
      forward_eps: keyStats.forwardEps || null,
      book_value: keyStats.bookValue || null,
      
      // Dados do setor (para valuation)
      industry_pe: price.industryPE || null,
      
      // Histórico de Free Cash Flow (para DCF)
      free_cash_flow_history: freeCashFlowHistory
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar fundamentals de ${ticker}:`, error.message);
    return null;
  }
}

// Calcular período inicial
function getPeriodStart(period) {
  const now = new Date();
  const periods = {
    '1d': 1,
    '5d': 5,
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
    '5y': 1825
  };
  
  const days = periods[period] || 365;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start;
}

// Buscar dados completos COM CACHE
async function getCompleteData(ticker) {
  const cacheKey = `complete_${ticker}`;
  
  // Verificar cache primeiro
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`✅ Dados de ${ticker} retornados do cache`);
    return { ...cached, fromCache: true };
  }
  
  try {
    console.log(`📊 Buscando dados REAIS do Yahoo Finance para ${ticker}...`);
    
    const [quote, fundamentals, historical] = await Promise.all([
      getQuote(ticker),
      getFundamentals(ticker),
      getHistoricalData(ticker, '1y', '1d')
    ]);
    
    if (!quote) {
      throw new Error('Não foi possível obter cotação');
    }
    
    const data = {
      quote,
      fundamentals: fundamentals || {},
      price_history: historical || [],
      fromCache: false,
      lastUpdated: new Date().toISOString()
    };
    
    // Salvar no cache
    cache.set(cacheKey, data);
    console.log(`✅ Dados de ${ticker} salvos no cache (TTL: 15min)`);
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar dados completos de ${ticker}:`, error.message);
    
    // Tentar retornar cache expirado como fallback
    const staleCache = cache.get(cacheKey);
    if (staleCache) {
      console.warn(`⚠️ Retornando cache EXPIRADO para ${ticker}`);
      return { ...staleCache, fromCache: true, stale: true };
    }
    
    throw error;
  }
}

// Limpar cache manualmente (útil para testes)
function clearCache(ticker = null) {
  if (ticker) {
    const cacheKey = `complete_${ticker}`;
    cache.del(cacheKey);
    console.log(`🗑️ Cache limpo para ${ticker}`);
  } else {
    cache.flushAll();
    console.log(`🗑️ Todo o cache foi limpo`);
  }
}

module.exports = {
  getQuote,
  getHistoricalData,
  getFundamentals,
  getCompleteData,
  toYahooTicker,
  clearCache
};
