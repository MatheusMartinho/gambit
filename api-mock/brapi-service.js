const axios = require('axios');

const BRAPI_BASE_URL = 'https://brapi.dev/api';

// Mapeamento de tickers brasileiros
const TICKER_MAP = {
  'VALE3': 'VALE3',
  'PETR4': 'PETR4',
  'ITUB4': 'ITUB4',
  'ITUB3': 'ITUB3',
  'BBDC4': 'BBDC4',
  'ABEV3': 'ABEV3',
  'WEGE3': 'WEGE3',
  'BBAS3': 'BBAS3',
  'RENT3': 'RENT3',
  'GGBR4': 'GGBR4',
  'SUZB3': 'SUZB3',
  'AZUL4': 'AZUL4'
};

// Buscar fundamentos completos
async function getFundamentals(ticker) {
  try {
    const brapiTicker = TICKER_MAP[ticker] || ticker;
    console.log(`📊 Buscando fundamentos da Brapi para ${brapiTicker}...`);
    
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${brapiTicker}`, {
      params: {
        fundamental: true,
        dividends: true,
        modules: 'summaryProfile,defaultKeyStatistics,financialData'
      }
    });
    
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      throw new Error('Dados não disponíveis na Brapi');
    }
    
    const data = response.data.results[0];
    
    return {
      quote: {
        price: data.regularMarketPrice || 0,
        change: data.regularMarketChange || 0,
        change_percent: data.regularMarketChangePercent || 0,
        volume: data.regularMarketVolume || 0,
        market_cap: data.marketCap || 0,
        open: data.regularMarketOpen || 0,
        high: data.regularMarketDayHigh || 0,
        low: data.regularMarketDayLow || 0,
        previous_close: data.regularMarketPreviousClose || 0,
        fifty_two_week_high: data.fiftyTwoWeekHigh || 0,
        fifty_two_week_low: data.fiftyTwoWeekLow || 0
      },
      fundamentals: {
        pe_ratio: data.priceEarnings || null,
        pb_ratio: data.priceToBook || null,
        dividend_yield: (data.dividendYield || 0) * 100,
        payout_ratio: data.payoutRatio ? data.payoutRatio * 100 : null,
        roe: data.returnOnEquity ? data.returnOnEquity * 100 : null,
        roa: data.returnOnAssets ? data.returnOnAssets * 100 : null,
        debt_to_equity: data.debtToEquity || null,
        current_ratio: data.currentRatio || null,
        profit_margin: data.profitMargins ? data.profitMargins * 100 : null,
        revenue_growth: data.revenueGrowth ? data.revenueGrowth * 100 : null,
        earnings_growth: data.earningsGrowth ? data.earningsGrowth * 100 : null,
        ebitda: data.ebitda || null,
        revenue: data.totalRevenue || null,
        gross_profit: data.grossProfit || null
      },
      company: {
        ticker: data.symbol || ticker,
        name: data.longName || data.shortName || ticker,
        sector: data.sector || 'N/A',
        industry: data.industry || 'N/A',
        description: data.longBusinessSummary || '',
        website: data.website || '',
        employees: data.fullTimeEmployees || 0
      },
      dividends: data.dividendsData?.cashDividends || []
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar fundamentos da Brapi para ${ticker}:`, error.message);
    return null;
  }
}

// Buscar apenas dividendos
async function getDividends(ticker) {
  try {
    const brapiTicker = TICKER_MAP[ticker] || ticker;
    console.log(`💰 Buscando dividendos da Brapi para ${brapiTicker}...`);
    
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${brapiTicker}`, {
      params: {
        dividends: true
      }
    });
    
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      throw new Error('Dados não disponíveis na Brapi');
    }
    
    const data = response.data.results[0];
    return data.dividendsData?.cashDividends || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar dividendos da Brapi para ${ticker}:`, error.message);
    return [];
  }
}

// Buscar múltiplas ações (para comparação)
async function getMultipleStocks(tickers) {
  try {
    const tickerList = tickers.map(t => TICKER_MAP[t] || t).join(',');
    console.log(`📊 Buscando múltiplas ações da Brapi: ${tickerList}...`);
    
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${tickerList}`, {
      params: {
        fundamental: true
      }
    });
    
    if (!response.data || !response.data.results) {
      throw new Error('Dados não disponíveis na Brapi');
    }
    
    return response.data.results.map(data => ({
      ticker: data.symbol,
      name: data.shortName || data.symbol,
      price: data.regularMarketPrice || 0,
      pe_ratio: data.priceEarnings || null,
      pb_ratio: data.priceToBook || null,
      dividend_yield: (data.dividendYield || 0) * 100,
      roe: data.returnOnEquity ? data.returnOnEquity * 100 : null,
      debt_to_equity: data.debtToEquity || null,
      market_cap: data.marketCap || 0
    }));
  } catch (error) {
    console.error(`❌ Erro ao buscar múltiplas ações da Brapi:`, error.message);
    return [];
  }
}

module.exports = {
  getFundamentals,
  getDividends,
  getMultipleStocks
};
