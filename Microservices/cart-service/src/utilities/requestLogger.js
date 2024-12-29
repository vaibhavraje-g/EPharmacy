const logger = require('./logger');

// This middleware logs request details
const requestLogger = (req, res, next) => {
  logger.info(`Request received: [${req.method}] ${req.url}`, {
    body: req.body || null,  // Log the request body (only if necessary for debugging)
    params: req.params || null, // Log URL parameters
    query: req.query || null,  // Log query parameters
  });
  next();  // Proceed to the next middleware or route handler
};

module.exports = requestLogger;
