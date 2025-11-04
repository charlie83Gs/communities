import morgan from "morgan";
import winston from "winston";
import * as fs from "fs";
import * as path from "path";

// Ensure logs directory exists
const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced console format with metadata
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info as any;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

// Winston logger configuration with custom levels for HTTP logging
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  }
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === "production" ? "info" : "http",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
  exitOnError: false,
});

// Simple Morgan middleware using combined format
// Output directly to console for visibility
export const morganMiddleware = morgan("combined", {
  stream: {
    write: (message) => {
      const msg = message.trim();
      console.log(`[HTTP] ${msg}`); // Direct console log for debugging
      try {
        logger.http(msg);
      } catch (err) {
        console.error('[Logger Error]', err);
      }
    }
  },
});

// Test that logger is initialized correctly
console.log('[Logger] Winston logger initialized with level:', logger.level);

// Export winston logger for use in application
export default logger;
