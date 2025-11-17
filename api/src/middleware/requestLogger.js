const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Request logger middleware
 * Logs all incoming requests and their responses
 */
function requestLogger(req, res, next) {
  // Generate unique request ID
  req.id = uuidv4();

  // Start timer
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    request_id: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    user_agent: req.get('user-agent'),
    user_id: req.user?.id
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;

    const duration = Date.now() - startTime;

    // Log response
    logger.info('Outgoing response', {
      request_id: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: duration,
      user_id: req.user?.id
    });

    return res.send(data);
  };

  next();
}

module.exports = requestLogger;
