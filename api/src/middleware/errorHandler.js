const logger = require('../utils/logger');
const { APIError } = require('../utils/errors');

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Handle APIError instances
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        status: err.statusCode,
        details: err.details
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        status: 400,
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        status: 400,
        details: err.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
        status: 401
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
        status: 401
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSON inválido',
        status: 400
      },
      meta: {
        request_id: req.id,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      status: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    },
    meta: {
      request_id: req.id,
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = errorHandler;
