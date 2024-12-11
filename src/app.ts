import express from 'express'
import routes from './routes'
import { errorHandler } from './middlewares/errorHandler'
import logger from './utils/logger'

const app = express()
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
})

app.use('/api', routes)

app.use(errorHandler)

export default app