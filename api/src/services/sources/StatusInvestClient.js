const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

/**
 * Status Invest Client - Scraping de dados completos
 */
class StatusInvestClient {
  constructor() {
    this.baseUrl = 'https://statusinvest.com.br';
    this.timeout = 10000;
  }

  /**
   * Busca dados completos do Status Invest
   */
  async getCompanyInfo(ticker) {
    try {
      logger.info(`Buscando dados do Status Invest para ${ticker}`);

      const url = `${this.baseUrl}/acoes/${ticker.toLowerCase()}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const $ = cheerio.load(response.data);

      // Verificar se a página existe
      if (response.data.includes('não encontrada') || response.data.includes('404')) {
        logger.warn(`Status Invest: Ação ${ticker} não encontrada`);
        return null;
      }

      return {
        ticker: ticker,
        name: this.extractName($),
        description: this.extractDescription($),
        sector: this.extractSector($),
        industry: this.extractIndustry($),
        website: this.extractWebsite($),
        address: this.extractAddress($),
        
        // Cotação
        price: this.extractPrice($),
        previousClose: this.extractPreviousClose($),
        open: this.extractOpen($),
        high: this.extractHigh($),
        low: this.extractLow($),
        volume: this.extractVolume($),
        avgVolume30d: this.extractAvgVolume($),
        
        // Indicadores
        pe: this.extractIndicator($, 'P/L'),
        pb: this.extractIndicator($, 'P/VP'),
        ps: this.extractIndicator($, 'P/ATIVO'),
        evEbitda: this.extractIndicator($, 'EV/EBITDA'),
        dividendYield: this.extractIndicator($, 'DY'),
        
        // Rentabilidade
        roe: this.extractIndicator($, 'ROE'),
        roa: this.extractIndicator($, 'ROA'),
        roic: this.extractIndicator($, 'ROIC'),
        roce: this.extractIndicator($, 'ROCE'),
        
        // Margens
        grossMargin: this.extractIndicator($, 'MARGEM BRUTA'),
        ebitdaMargin: this.extractIndicator($, 'MARGEM EBITDA'),
        operatingMargin: this.extractIndicator($, 'MARGEM OPERACIONAL'),
        netMargin: this.extractIndicator($, 'MARGEM LÍQUIDA'),
        
        // Endividamento
        debtToEquity: this.extractIndicator($, 'DÍV. LÍQUIDA/PL'),
        currentRatio: this.extractIndicator($, 'LIQUIDEZ CORRENTE'),
        quickRatio: this.extractIndicator($, 'LIQUIDEZ SECA'),
        
        // Crescimento
        revenueCagr5y: this.extractGrowth($, 'CAGR RECEITAS 5 ANOS'),
        earningsCagr5y: this.extractGrowth($, 'CAGR LUCROS 5 ANOS'),
        
        // Payout
        payoutRatio: this.extractIndicator($, 'PAYOUT'),
        
        // Dados financeiros
        revenue: this.extractFinancialData($, 'RECEITA LÍQUIDA'),
        ebitda: this.extractFinancialData($, 'EBITDA'),
        netIncome: this.extractFinancialData($, 'LUCRO LÍQUIDO'),
        equity: this.extractFinancialData($, 'PATRIMÔNIO LÍQUIDO'),
        totalAssets: this.extractFinancialData($, 'ATIVO TOTAL'),
        totalDebt: this.extractFinancialData($, 'DÍVIDA BRUTA'),
        cash: this.extractFinancialData($, 'DISPONIBILIDADES'),
        operatingCashFlow: this.extractFinancialData($, 'FCO'),
        freeCashFlow: this.extractFinancialData($, 'FCL'),
        capex: this.extractFinancialData($, 'CAPEX'),
        
        // Ações
        sharesOutstanding: this.extractShares($),
        freeFloat: this.extractFreeFloat($),
        
        // Outros
        beta: this.extractBeta($),
        eps: this.extractEPS($),
        bookValuePerShare: this.extractVPA($),
        
        // Dividendos
        dividends: this.extractDividends($),
        
        // Scores
        piotroskiScore: this.extractPiotroski($),
        altmanZScore: this.extractAltman($)
      };

    } catch (error) {
      logger.warn(`Status Invest falhou para ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Métodos de extração
   */
  extractName($) {
    return $('.company-name, .lh-4').first().text().trim() || null;
  }

  extractDescription($) {
    return $('.company-description, .description').first().text().trim() || null;
  }

  extractSector($) {
    return $('.sector-name, [title="Setor"]').first().text().trim() || null;
  }

  extractIndustry($) {
    return $('.industry-name, [title="Subsetor"]').first().text().trim() || null;
  }

  extractWebsite($) {
    return $('a[href*="http"]').filter((i, el) => {
      const href = $(el).attr('href');
      return href && !href.includes('statusinvest');
    }).first().attr('href') || null;
  }

  extractAddress($) {
    const addressText = $('.address, .company-address').text().trim();
    if (!addressText) return null;
    
    return {
      full: addressText,
      cidade: null,
      uf: null,
      pais: 'Brasil'
    };
  }

  extractPrice($) {
    const priceText = $('.value, .price, [title="Cotação"]').first().text().trim();
    return this.convertToNumber(priceText);
  }

  extractPreviousClose($) {
    return this.extractPrice($); // Simplificado
  }

  extractOpen($) {
    return this.extractIndicator($, 'ABERTURA');
  }

  extractHigh($) {
    return this.extractIndicator($, 'MÁXIMA');
  }

  extractLow($) {
    return this.extractIndicator($, 'MÍNIMA');
  }

  extractVolume($) {
    const volumeText = $('[title="Volume"]').text().trim();
    return this.convertToNumber(volumeText);
  }

  extractAvgVolume($) {
    const avgText = $('[title="Volume Médio"]').text().trim();
    return this.convertToNumber(avgText);
  }

  extractIndicator($, name) {
    try {
      // Buscar por título ou texto
      const element = $(`[title="${name}"], strong:contains("${name}")`).closest('.item, .indicator').find('.value, .number');
      
      if (element.length === 0) {
        // Busca alternativa
        const alt = $(`:contains("${name}")`).filter((i, el) => {
          return $(el).text().trim() === name;
        }).parent().find('.value, .number');
        
        if (alt.length > 0) {
          return this.convertToNumber(alt.first().text());
        }
        return null;
      }

      return this.convertToNumber(element.first().text());
    } catch (error) {
      return null;
    }
  }

  extractGrowth($, name) {
    const value = this.extractIndicator($, name);
    return value ? value / 100 : null; // Converter para decimal
  }

  extractFinancialData($, name) {
    return this.extractIndicator($, name);
  }

  extractShares($) {
    const text = $('[title="Ações"]').text().trim();
    return this.convertToNumber(text);
  }

  extractFreeFloat($) {
    const text = $('[title="Free Float"]').text().trim();
    const number = this.convertToNumber(text);
    return number ? number / 100 : null;
  }

  extractBeta($) {
    return this.extractIndicator($, 'BETA');
  }

  extractEPS($) {
    return this.extractIndicator($, 'LPA');
  }

  extractVPA($) {
    return this.extractIndicator($, 'VPA');
  }

  extractPiotroski($) {
    return this.extractIndicator($, 'PIOTROSKI');
  }

  extractAltman($) {
    return this.extractIndicator($, 'ALTMAN Z-SCORE');
  }

  extractDividends($) {
    const dividends = [];
    
    try {
      $('.dividend-row, .table-dividends tr').each((i, elem) => {
        const $row = $(elem);
        
        const exDate = $row.find('.date, td:nth-child(1)').text().trim();
        const value = $row.find('.value, td:nth-child(2)').text().trim();
        const type = $row.find('.type, td:nth-child(3)').text().trim();
        
        if (exDate && value) {
          dividends.push({
            exDate: this.parseDate(exDate),
            value: this.convertToNumber(value),
            type: type || 'Dividendo'
          });
        }
      });
    } catch (error) {
      logger.debug('Erro ao extrair dividendos:', error.message);
    }
    
    return dividends;
  }

  /**
   * Helpers
   */
  convertToNumber(text) {
    if (!text || text === '-' || text === 'N/A') return null;
    
    // Remove tudo exceto números, vírgula, ponto e sinal
    let cleaned = text.replace(/[^\d,.-]/g, '');
    
    // Detectar se usa vírgula como decimal
    if (cleaned.includes(',')) {
      // Remove pontos de milhar e troca vírgula por ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
  }

  parseDate(dateStr) {
    try {
      // Formato: DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    } catch (error) {
      return dateStr;
    }
  }
}

module.exports = StatusInvestClient;
