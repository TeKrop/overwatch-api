// GLOBAL
const winston = require('winston'); // Winston Logging System
const DailyRotateFile = require('winston-daily-rotate-file'); // Winston Daily Log Rotation

// LOCAL
const Config = require('../config/app-config');

// logger initialisation
const customWinstonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} ${info.level} : ${info.message}`),
);

// create logger with console transports (with colors)
const LoggerService = winston.createLogger({
  level: Config.LOG_LEVEL || 'info',
  format: customWinstonFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customWinstonFormat,
      ),
    }),
  ],
});

// if enabled in configuration, add transport with rotating log files
if (Config.ENABLE_LOGS) {
  LoggerService.add(
    new DailyRotateFile({
      datePattern: 'YYYY-MM-DD',
      zippedArchive: Config.ZIP_LOGS,
      filename: Config.LOG_FILENAME,
      dirname: Config.LOG_PATH,
    }),
  );
}

module.exports = LoggerService;
