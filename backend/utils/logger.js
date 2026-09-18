/**
 * Logger Utility
 * Structured logging with levels and colours
 */

const isDev = process.env.NODE_ENV !== 'production';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const timestamp = () => new Date().toISOString();

const format = (level, color, icon, ...args) => {
  const prefix = isDev
    ? `${color}${icon} [${level}] ${colors.gray}${timestamp()}${colors.reset}`
    : `[${level}] ${timestamp()}`;
  console.log(prefix, ...args);
};

const logger = {
  info: (...args) => format('INFO', colors.blue, 'ℹ', ...args),
  success: (...args) => format('SUCCESS', colors.green, '✅', ...args),
  warn: (...args) => format('WARN', colors.yellow, '⚠️', ...args),
  error: (...args) => format('ERROR', colors.red, '❌', ...args),
  debug: (...args) => isDev && format('DEBUG', colors.cyan, '🔍', ...args),
  http: (req, res, time) => {
    const statusColor =
      res.statusCode >= 500 ? colors.red :
      res.statusCode >= 400 ? colors.yellow :
      res.statusCode >= 300 ? colors.cyan :
      colors.green;

    if (isDev) {
      console.log(
        `${colors.gray}[HTTP]${colors.reset} ${statusColor}${res.statusCode}${colors.reset}`,
        `${req.method} ${req.originalUrl}`,
        `${colors.gray}${time}ms${colors.reset}`
      );
    }
  },
};

// Express request logger middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.http(req, res, Date.now() - start));
  next();
};

module.exports = logger;
