import type { Request, Response, NextFunction } from 'express'
import type { ProcessImagesResult } from '../types/services'
import { processImages } from '../services/imageService/index.service'
import logger from '../utils/logger'

/**
 * Handles image transformation requests, validating input and invoking the image processing service.
 * 
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function for error handling
 */
export const handleImageTransform = async (
    request: Request, 
    response: Response<ProcessImagesResult>, 
    next: NextFunction
): Promise<void> => {
    try {
        const { type } = request.body
        const files = request.files as Express.Multer.File[]

        logger.info('Start processing files', files)
 
        const result = await processImages(type, files)
        
        logger.info('finished processing files', result)

        response.status(200).json(result)
    } catch (error) {
        const err = error as Error
        logger.error('Error caught in controller:', {
            message: err.message
        })
        next(error)
    }
}