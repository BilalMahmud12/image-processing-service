import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

interface CustomError extends Error {
    status?: number
}

export const errorHandler = (
    error: CustomError,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    logger.error(`Error: ${error.message}`, { stack: error.stack });

    response.status(error.status || 500).json({
        error: error.status === 500 ? 'Internal Server Error' : error.message,
    })
};
