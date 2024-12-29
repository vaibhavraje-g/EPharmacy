const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a logger with custom formats
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [
    // Console transport to log to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.json(), // Use JSON for better structure
        winston.format.timestamp()
      )
    }),

    // File transport for general logs (info level and above)
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp()
      )
    })
  ]
});

module.exports = logger;
