import express from 'express'
import cors from 'cors'
import routes from './routes'
import { errorHandler } from './middlewares/errorHandler'
import { multerErrorHandler } from './middlewares/multerErrorHandler'
import logger from './utils/logger'

const app = express()

app.use(cors({
    origin: '*',
    methods: ['POST'],
    credentials: true,
}))

app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
})

app.use('/api', routes)

app.use(errorHandler as (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) => void)

app.use(multerErrorHandler as (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) => void)

export default app