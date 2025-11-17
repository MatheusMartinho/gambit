const DataAggregator = require('./dataAggregator');
const AnalyticsEngine = require('./analyticsEngine');
const { StockNotFoundError, InvalidTickerError } = require('../utils/errors');
const logger = require('../utils/logger');

class StocksService {
  /**
   * Get complete stock overview with all data
   */
  async getCompleteOverview(ticker, options = {}) {
    try {
      // Validate ticker format
      if (!this.isValidTicker(ticker)) {
        throw new InvalidTickerError(ticker, this.getSuggestions(ticker));
      }

      logger.info(`Buscando overview completo de ${ticker}`);

      // Aggregate data from multiple sources
      const aggregatedData = await DataAggregator.collectStockData(ticker);

      if (!aggregatedData || !aggregatedData.company) {
        throw new StockNotFoundError(ticker, this.getSuggestions(ticker));
      }

      // Calculate advanced metrics
      const healthScore = await AnalyticsEngine.calculateHealthScore(
        aggregatedData.key_metrics,
        aggregatedData.financials
      );

      const valuationVerdict = await AnalyticsEngine.calculateValuation(
        ticker,
        aggregatedData.key_metrics,
        aggregatedData.financials
      );

      const quickInsights = this.generateQuickInsights(
        aggregatedData,
        healthScore,
        valuationVerdict
      );

      const momentum = this.calculateMomentum(aggregatedData);

      // Build complete response
      const response = {
        company: aggregatedData.company,
        quote: aggregatedData.quote,
        intraday_chart: aggregatedData.intraday_chart,
        key_metrics: aggregatedData.key_metrics,
        health_score: healthScore,
        valuation_verdict: valuationVerdict,
        quick_insights: quickInsights,
        momentum: momentum,
        _sources: aggregatedData._sources
      };

      return response;

    } catch (error) {
      logger.error(`Error in getCompleteOverview for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Get current quote (real-time price)
   */
  async getCurrentQuote(ticker) {
    try {
      const data = await DataAggregator.collectStockData(ticker);
      return data.quote;

    } catch (error) {
      logger.error(`Error in getCurrentQuote for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Generate quick insights
   */
  generateQuickInsights(data, healthScore, valuationVerdict) {
    const insights = {
      tldr: this.generateTLDR(data, valuationVerdict),
      recommendation: valuationVerdict.verdict,
      investment_thesis: this.generateInvestmentThesis(data),
      key_positives: this.identifyPositives(data, healthScore),
      key_negatives: this.identifyNegatives(data, healthScore),
      ideal_for: this.identifyInvestorProfile(data, valuationVerdict)
    };

    return insights;
  }

  generateTLDR(data, verdict) {
    const upside = verdict.upside_percent;
    const roe = data.key_metrics.roe;
    
    if (upside > 15 && roe > 20) {
      return `Negociando ${Math.abs(upside).toFixed(0)}% abaixo do preço justo com fundamentos sólidos`;
    } else if (upside > 15) {
      return `Oportunidade de valuation com ${Math.abs(upside).toFixed(0)}% de upside potencial`;
    } else if (roe > 20) {
      return `Empresa de alta qualidade com ROE de ${roe.toFixed(0)}%`;
    }
    
    return `Empresa com fundamentos equilibrados`;
  }

  generateInvestmentThesis(data) {
    const thesis = [];
    
    if (data.key_metrics.roe > 20) {
      thesis.push('Rentabilidade excepcional acima de 20% ROE');
    }
    
    if (data.key_metrics.debt_to_ebitda < 2) {
      thesis.push('Balanço saudável com baixo endividamento');
    }
    
    if (data.key_metrics.dividend_yield > 5) {
      thesis.push('Dividendos atrativos com yield acima de 5%');
    }
    
    return thesis;
  }

  identifyPositives(data, healthScore) {
    const positives = [];
    
    if (data.key_metrics.roe > 20) {
      positives.push(`ROE de ${data.key_metrics.roe.toFixed(1)}% - Top 10% do setor`);
    }
    
    if (data.key_metrics.debt_to_ebitda < 1) {
      positives.push(`Dívida baixa ${data.key_metrics.debt_to_ebitda.toFixed(1)}x EBITDA`);
    }
    
    if (data.key_metrics.dividend_yield > 5) {
      positives.push(`Dividend Yield atrativo de ${data.key_metrics.dividend_yield.toFixed(1)}%`);
    }
    
    if (data.key_metrics.current_ratio > 1.5) {
      positives.push(`Liquidez saudável de ${data.key_metrics.current_ratio.toFixed(2)}x`);
    }
    
    return positives;
  }

  identifyNegatives(data, healthScore) {
    const negatives = [];
    
    if (data.key_metrics.revenue_cagr_5y < 5) {
      negatives.push(`Crescimento moderado CAGR ${data.key_metrics.revenue_cagr_5y.toFixed(1)}%`);
    }
    
    if (data.key_metrics.debt_to_ebitda > 3) {
      negatives.push(`Endividamento elevado ${data.key_metrics.debt_to_ebitda.toFixed(1)}x EBITDA`);
    }
    
    if (data.key_metrics.current_ratio < 1) {
      negatives.push(`Liquidez baixa ${data.key_metrics.current_ratio.toFixed(2)}x`);
    }
    
    return negatives;
  }

  identifyInvestorProfile(data, verdict) {
    const profiles = [];
    
    if (verdict.upside_percent > 15) {
      profiles.push('Value Investing');
    }
    
    if (data.key_metrics.dividend_yield > 5) {
      profiles.push('Income (Dividendos)');
    }
    
    if (data.key_metrics.revenue_cagr_5y > 15) {
      profiles.push('Growth');
    }
    
    return profiles.join(' + ') || 'Balanceado';
  }

  /**
   * Get intraday chart data
   */
  async getIntradayChart(ticker, interval = '5min') {
    try {
      const chartData = await DataAggregator.fetchIntradayChart(ticker, interval);

      return {
        interval,
        data: chartData || [],
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error in getIntradayChart for ${ticker}:`, error);
      return {
        interval,
        data: [],
        error: 'Chart data temporarily unavailable'
      };
    }
  }

  /**
   * Extract key metrics from aggregated data
   */
  extractKeyMetrics(data) {
    const financials = data.financials || {};
    const quote = data.quote || {};

    return {
      pe_ratio: this.calculatePE(quote.price, financials.eps),
      pb_ratio: this.calculatePB(quote.price, financials.book_value_per_share),
      ps_ratio: this.calculatePS(quote.market_cap, financials.revenue),
      pcf_ratio: this.calculatePCF(quote.market_cap, financials.operating_cash_flow),
      ev_ebitda: this.calculateEVEBITDA(quote.market_cap, financials),
      dividend_yield: this.calculateDividendYield(financials.dividends_ttm, quote.price),
      payout_ratio: this.calculatePayoutRatio(financials.dividends_ttm, financials.net_income),
      roe: financials.roe || null,
      roic: financials.roic || null,
      roa: financials.roa || null,
      debt_to_ebitda: this.calculateDebtToEBITDA(financials),
      current_ratio: this.calculateCurrentRatio(financials),
      beta: quote.beta || null,
      revenue_cagr_5y: financials.revenue_cagr_5y || null,
      earnings_cagr_5y: financials.earnings_cagr_5y || null
    };
  }

  /**
   * Validate ticker format (XXXX3, XXXX4, etc.)
   */
  isValidTicker(ticker) {
    const tickerRegex = /^[A-Z]{4}[0-9]{1,2}$/;
    return tickerRegex.test(ticker);
  }

  /**
   * Get ticker suggestions for invalid/not found tickers
   */
  getSuggestions(ticker) {
    // Simple logic: suggest common variations
    const base = ticker.substring(0, 4);
    return [`${base}3`, `${base}4`, `${base}11`];
  }

  // Financial calculation helpers
  calculatePE(price, eps) {
    if (!price || !eps || eps <= 0) return null;
    return parseFloat((price / eps).toFixed(2));
  }

  calculatePB(price, bookValue) {
    if (!price || !bookValue || bookValue <= 0) return null;
    return parseFloat((price / bookValue).toFixed(2));
  }

  calculatePS(marketCap, revenue) {
    if (!marketCap || !revenue || revenue <= 0) return null;
    return parseFloat((marketCap / revenue).toFixed(2));
  }

  calculatePCF(marketCap, cashFlow) {
    if (!marketCap || !cashFlow || cashFlow <= 0) return null;
    return parseFloat((marketCap / cashFlow).toFixed(2));
  }

  calculateEVEBITDA(marketCap, financials) {
    const { cash = 0, total_debt = 0, ebitda = 0 } = financials;
    if (!ebitda || ebitda <= 0) return null;
    
    const enterpriseValue = marketCap + total_debt - cash;
    return parseFloat((enterpriseValue / ebitda).toFixed(2));
  }

  calculateDividendYield(dividends, price) {
    if (!dividends || !price || price <= 0) return null;
    return parseFloat(((dividends / price) * 100).toFixed(2));
  }

  calculatePayoutRatio(dividends, netIncome) {
    if (!dividends || !netIncome || netIncome <= 0) return null;
    return parseFloat(((dividends / netIncome) * 100).toFixed(2));
  }

  calculateDebtToEBITDA(financials) {
    const { total_debt = 0, ebitda = 0 } = financials;
    if (!ebitda || ebitda <= 0) return null;
    return parseFloat((total_debt / ebitda).toFixed(2));
  }

  calculateCurrentRatio(financials) {
    const { current_assets = 0, current_liabilities = 0 } = financials;
    if (!current_liabilities || current_liabilities <= 0) return null;
    return parseFloat((current_assets / current_liabilities).toFixed(2));
  }
}

module.exports = new StocksService();
