const express = require('express');
const router = express.Router();

// Import route modules
const searchRoutes = require('./search');
const stocksRoutes = require('./stocks');
const fundamentalsRoutes = require('./fundamentals');
const dividendsRoutes = require('./dividends');
const valuationRoutes = require('./valuation');
const healthScoreRoutes = require('./healthScore');
const compareRoutes = require('./compare');
const alertsRoutes = require('./alerts');

// Mount routes
router.use('/search', searchRoutes);
router.use('/stocks', stocksRoutes);
router.use('/stocks', fundamentalsRoutes);
router.use('/stocks', dividendsRoutes);
router.use('/stocks', valuationRoutes);
router.use('/stocks', healthScoreRoutes);
router.use('/compare', compareRoutes);
router.use('/alerts', alertsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Gambit API',
    version: process.env.API_VERSION || 'v1',
    description: 'API REST para análise fundamentalista de ações B3',
    endpoints: {
      search: '/search',
      stocks: '/stocks/:ticker',
      fundamentals: '/stocks/:ticker/fundamentals',
      dividends: '/stocks/:ticker/dividends',
      valuation: '/stocks/:ticker/valuation',
      healthScore: '/stocks/:ticker/health-score',
      compare: '/compare',
      alerts: '/alerts'
    },
    documentation: '/docs',
    status: 'operational'
  });
});

module.exports = router;
