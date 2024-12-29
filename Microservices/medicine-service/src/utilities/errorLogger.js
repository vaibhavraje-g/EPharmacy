const logger = require('./logger');

// This middleware logs error details
const errorLogger = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.url} - ${err.message}`, {
    stack: err.stack, // Include the stack trace for detailed error debugging
    status: err.status || 500, // Log the error status code if available
    body: req.body || null, // Optionally log the request body (useful for POST requests)
    params: req.params || null, // Log URL parameters
    query: req.query || null, // Log query parameters
  });
  next(err); // Proceed to the next error handler if needed
};

module.exports = errorLogger;
