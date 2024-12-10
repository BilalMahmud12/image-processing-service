import app from './app'
import logger from './utils/logger'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    logger.info(`Image processing service running on port ${PORT}`)
})

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack })
    process.exit(1)
})

process.on('unhandledRejection', (reason: any, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason })
    process.exit(1)
})