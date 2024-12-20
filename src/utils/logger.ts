import { createLogger, format, transports } from 'winston'

const isDevelopment = process.env.NODE_ENV !== 'production'
const { combine, timestamp, printf, colorize, errors } = format

const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : ''
    return `${timestamp} ${level}: ${stack || message} ${meta}`
})

const logger = createLogger({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    format: combine(
        colorize(),
        timestamp(),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.Console(),
    ],
})

export default logger
