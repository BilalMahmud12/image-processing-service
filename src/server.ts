import dotenv from 'dotenv'
import { env } from './config/env'
import app from './app'
import logger from './utils/logger'

const PORT = env.port || 3000
dotenv.config({ path: env.nodeEnv === 'test' ? '.env.test' : '.env' })

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