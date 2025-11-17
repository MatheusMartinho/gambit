const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Yahoo Finance Client - Busca cotações e gráficos
 */
class YahooFinanceClient {
  constructor() {
    this.baseUrl = 'https://query1.finance.yahoo.com/v8/finance';
    this.timeout = 5000;
  }

  /**
   * Busca cotação e gráfico do Yahoo Finance
   */
  async getQuoteAndChart(ticker) {
    try {
      // Converter ticker B3 para formato Yahoo (VALE3 -> VALE3.SA)
      const yahooTicker = this.convertToYahooTicker(ticker);

      logger.info(`Buscando dados do Yahoo Finance para ${yahooTicker}`);

      // Buscar cotação e gráfico em paralelo
      const [quote, chart] = await Promise.allSettled([
        this.getQuote(yahooTicker),
        this.getChart(yahooTicker)
      ]);

      const quoteData = quote.status === 'fulfilled' ? quote.value : null;
      const chartData = chart.status === 'fulfilled' ? chart.value : [];

      if (!quoteData) {
        logger.warn(`Yahoo Finance: Sem dados de cotação para ${ticker}`);
        return null;
      }

      return {
        price: quoteData.regularMarketPrice,
        previousClose: quoteData.regularMarketPreviousClose,
        open: quoteData.regularMarketOpen,
        high: quoteData.regularMarketDayHigh,
        low: quoteData.regularMarketDayLow,
        volume: quoteData.regularMarketVolume,
        avgVolume: quoteData.averageDailyVolume3Month,
        marketCap: quoteData.marketCap,
        chart: chartData
      };

    } catch (error) {
      logger.warn(`Yahoo Finance falhou para ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Busca cotação
   */
  async getQuote(yahooTicker) {
    const url = `${this.baseUrl}/quote?symbols=${yahooTicker}`;
    
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const quote = response.data.quoteResponse?.result?.[0];
    
    if (!quote) {
      throw new Error('Sem dados de cotação');
    }

    return quote;
  }

  /**
   * Busca gráfico intraday
   */
  async getChart(yahooTicker) {
    const url = `${this.baseUrl}/chart/${yahooTicker}?interval=5m&range=1d`;
    
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return this.parseChart(response.data);
  }

  /**
   * Converte ticker B3 para formato Yahoo
   */
  convertToYahooTicker(ticker) {
    // VALE3 -> VALE3.SA
    return `${ticker}.SA`;
  }

  /**
   * Parse chart data
   */
  parseChart(data) {
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    return timestamps.map((timestamp, i) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      price: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0
    })).filter(point => point.price > 0);
  }
}

module.exports = YahooFinanceClient;
