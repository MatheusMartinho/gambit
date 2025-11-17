const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../cache/redis');
const { RateLimitError } = require('../utils/errors');

/**
 * Rate limiter configurations
 */
const RATE_LIMITS = {
  anonymous: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_ANONYMOUS_PER_MIN) || 10,
    message: 'Muitas requisições. Tente novamente em 1 minuto.'
  },
  authenticated: {
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTHENTICATED_PER_MIN) || 60,
    message: 'Muitas requisições. Tente novamente em 1 minuto.'
  },
  premium: {
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_PREMIUM_PER_MIN) || 300,
    message: 'Muitas requisições. Tente novamente em 1 minuto.'
  }
};

/**
 * Create rate limiter middleware
 */
function createRateLimiter(tier = 'anonymous') {
  const config = RATE_LIMITS[tier];

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    
    // Use Redis store if available
    store: process.env.REDIS_URL ? new RedisStore({
      client: getRedisClient(),
      prefix: `ratelimit:${tier}:`
    }) : undefined,

    // Custom handler
    handler: (req, res) => {
      const error = new RateLimitError(config.windowMs / 1000);
      res.status(429).json(error.toJSON());
    },

    // Key generator
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },

    // Skip successful requests (optional)
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  });
}

/**
 * Dynamic rate limiter based on user tier
 */
function rateLimiter(req, res, next) {
  // Determine user tier
  let tier = 'anonymous';
  
  if (req.user) {
    tier = req.user.tier || 'authenticated';
  }

  // Apply appropriate rate limiter
  const limiter = createRateLimiter(tier);
  limiter(req, res, next);
}

/**
 * Specific rate limiters for different endpoints
 */
const searchLimiter = createRateLimiter('anonymous');
const quoteLimiter = createRateLimiter('authenticated');
const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Very restrictive for heavy operations
  message: 'Operação pesada. Limite: 5 requisições por minuto.'
});

module.exports = {
  rateLimiter,
  searchLimiter,
  quoteLimiter,
  heavyLimiter,
  createRateLimiter
};
