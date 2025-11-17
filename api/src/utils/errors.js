/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        status: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Predefined error types
 */
class ValidationError extends APIError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class NotFoundError extends APIError {
  constructor(resource, identifier) {
    super(
      `${resource} não encontrado: ${identifier}`,
      404,
      'NOT_FOUND',
      { resource, identifier }
    );
  }
}

class UnauthorizedError extends APIError {
  constructor(message = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends APIError {
  constructor(message = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

class RateLimitError extends APIError {
  constructor(retryAfter = 60) {
    super(
      'Limite de requisições excedido',
      429,
      'RATE_LIMIT_EXCEEDED',
      { retry_after: retryAfter }
    );
  }
}

class DataUnavailableError extends APIError {
  constructor(message = 'Dados temporariamente indisponíveis') {
    super(message, 503, 'DATA_UNAVAILABLE');
  }
}

class InvalidTickerError extends APIError {
  constructor(ticker, suggestions = []) {
    super(
      `Ticker inválido: ${ticker}`,
      400,
      'INVALID_TICKER',
      { ticker, suggestions }
    );
  }
}

class StockNotFoundError extends APIError {
  constructor(ticker, suggestions = []) {
    super(
      `Ação não encontrada: ${ticker}`,
      404,
      'STOCK_NOT_FOUND',
      { ticker, suggestions }
    );
  }
}

module.exports = {
  APIError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  DataUnavailableError,
  InvalidTickerError,
  StockNotFoundError
};
