const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const { validateTicker } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/v1/stocks/:ticker
 * @desc    Get complete stock overview
 * @access  Public
 */
router.get(
  '/:ticker',
  rateLimiter,
  validateTicker,
  stocksController.getStockOverview
);

/**
 * @route   GET /api/v1/stocks/:ticker/quote
 * @desc    Get current quote (real-time price)
 * @access  Public
 */
router.get(
  '/:ticker/quote',
  rateLimiter,
  validateTicker,
  stocksController.getQuote
);

/**
 * @route   GET /api/v1/stocks/:ticker/chart
 * @desc    Get intraday chart data
 * @access  Public
 */
router.get(
  '/:ticker/chart',
  rateLimiter,
  validateTicker,
  stocksController.getIntradayChart
);

module.exports = router;
