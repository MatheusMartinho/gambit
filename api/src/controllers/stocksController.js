const StocksService = require('../services/stocksService');
const CacheManager = require('../cache/cacheManager');
const logger = require('../utils/logger');
const { APIError } = require('../utils/errors');

class StocksController {
  /**
   * Get complete stock overview
   */
  async getStockOverview(req, res, next) {
    try {
      const { ticker } = req.params;
      const { fields = 'all', include = [] } = req.query;

      logger.info(`Fetching overview for ${ticker}`);

      // Try cache first
      const cacheKey = `overview:${ticker}:${fields}`;
      const cached = await CacheManager.get(cacheKey);
      
      if (cached) {
        logger.info(`Cache hit for ${ticker}`);
        return res.json({
          success: true,
          data: cached,
          meta: {
            request_id: req.id,
            generated_at: new Date().toISOString(),
            cache_hit: true
          }
        });
      }

      // Fetch fresh data
      const startTime = Date.now();
      const data = await StocksService.getCompleteOverview(ticker, {
        fields,
        include: Array.isArray(include) ? include : [include]
      });

      // Cache the result
      await CacheManager.set(
        cacheKey,
        data,
        parseInt(process.env.CACHE_TTL_QUOTE) || 60
      );

      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        data,
        meta: {
          request_id: req.id,
          generated_at: new Date().toISOString(),
          execution_time_ms: executionTime,
          cache_hit: false,
          data_sources: data._sources || []
        }
      });

    } catch (error) {
      logger.error(`Error fetching overview for ${req.params.ticker}:`, error);
      next(error);
    }
  }

  /**
   * Get current quote (real-time price)
   */
  async getQuote(req, res, next) {
    try {
      const { ticker } = req.params;

      const quote = await StocksService.getCurrentQuote(ticker);

      res.json({
        success: true,
        data: quote,
        meta: {
          request_id: req.id,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching quote for ${req.params.ticker}:`, error);
      next(error);
    }
  }

  /**
   * Get intraday chart data
   */
  async getIntradayChart(req, res, next) {
    try {
      const { ticker } = req.params;
      const { interval = '5min' } = req.query;

      const chartData = await StocksService.getIntradayChart(ticker, interval);

      res.json({
        success: true,
        data: chartData,
        meta: {
          request_id: req.id,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching chart for ${req.params.ticker}:`, error);
      next(error);
    }
  }
}

module.exports = new StocksController();
