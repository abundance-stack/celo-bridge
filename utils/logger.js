import { createLogger, format, transports } from 'winston'

const loggerFormat = format.combine(format.colorize(), format.simple())

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: loggerFormat,
  transports: [new transports.Console({ level: process.env.LOG_LEVEL })]
})

logger.json = (obj, logLevel = 'debug') => {
  logger[logLevel](JSON.stringify(obj, null, 2))
}

export default logger
