const Joi = require('joi');
const { ValidationError, InvalidTickerError } = require('../utils/errors');

/**
 * Ticker validation regex
 */
const TICKER_REGEX = /^[A-Z]{4}[0-9]{1,2}$/;

/**
 * Validate ticker format
 */
function validateTicker(req, res, next) {
  const { ticker } = req.params;

  if (!ticker) {
    return next(new ValidationError('Ticker é obrigatório'));
  }

  const upperTicker = ticker.toUpperCase();

  if (!TICKER_REGEX.test(upperTicker)) {
    return next(new InvalidTickerError(upperTicker, getSuggestions(upperTicker)));
  }

  // Normalize ticker to uppercase
  req.params.ticker = upperTicker;
  next();
}

/**
 * Get ticker suggestions
 */
function getSuggestions(ticker) {
  const base = ticker.substring(0, 4);
  return [`${base}3`, `${base}4`, `${base}11`];
}

/**
 * Validate request body against Joi schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return next(new ValidationError('Erro de validação', {
        fields: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }));
    }

    req.body = value;
    next();
  };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return next(new ValidationError('Erro de validação', {
        fields: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }));
    }

    req.query = value;
    next();
  };
}

/**
 * Common validation schemas
 */
const schemas = {
  // Search query
  search: Joi.object({
    q: Joi.string().required().min(1).max(50),
    type: Joi.string().valid('stock', 'fii', 'etf'),
    sector: Joi.string().max(100),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1)
  }),

  // Stock overview query
  stockOverview: Joi.object({
    fields: Joi.string().valid('all', 'basic', 'detailed').default('all'),
    include: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).default([])
  }),

  // Compare request
  compare: Joi.object({
    tickers: Joi.array().items(
      Joi.string().regex(TICKER_REGEX)
    ).min(2).max(10).required(),
    metrics: Joi.array().items(Joi.string()).min(1),
    include_sector_average: Joi.boolean().default(false)
  }),

  // Alert creation
  createAlert: Joi.object({
    ticker: Joi.string().regex(TICKER_REGEX).required(),
    alert_type: Joi.string().valid('price', 'volume', 'dividend', 'earnings').required(),
    condition: Joi.string().valid('above', 'below', 'equals').required(),
    threshold: Joi.number().required(),
    notification_channels: Joi.array().items(
      Joi.string().valid('email', 'push', 'sms')
    ).default(['email']),
    expires_at: Joi.date().iso().greater('now')
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort_by: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

module.exports = {
  validateTicker,
  validateBody,
  validateQuery,
  schemas
};
