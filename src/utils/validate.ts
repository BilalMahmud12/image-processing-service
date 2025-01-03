import { ApplicationError } from './ApplicationError'
import type { Request, NextFunction, Response } from 'express'
import { imageConfig } from '../config/imageConfig'
import logger from '../utils/logger'
import sharp from 'sharp'

export const validateImageTransformInput = (
    request: Request, 
    response: Response, 
    next: NextFunction
) => {
    const { type } = request.body
    const files = request.files as Express.Multer.File[]

    logger.info('Started Validating Image Transform Input', { type, files })

    if (!type) {
        logger.error('Validation Error: The type field is required', {
            code: 400,
            data: request.body
        })
        
        throw new ApplicationError('The type field is required', 400)
    }

    if (!files || files.length === 0) {
        logger.error('Validation Error: No files uploaded', {
            code: 400,
            data: request.body
        })

        throw new ApplicationError('No files uploaded', 400)
    }

    if (!imageConfig[type]) {
        logger.error('Validation Error: The provided image type is invalid', {
            code: 400,
            data: request.body
        })

        throw new ApplicationError('The provided image type is invalid', 400)
    }

    next()
}

export const validateImageCropInput = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { width, height, left = 0, top = 0 } = request.body
        const files = request.files as Express.Multer.File[]
    
        if (!files || files.length === 0) {
            logger.error('Validation Error: No file was uploaded', { code: 400, data: request.body })
            throw next(new ApplicationError('No file was uploaded', 400))
        }
    
        if (files.length > 1) {
            logger.error('Validation Error: Only one file is allowed', { code: 400, data: request.body })
            throw next(new ApplicationError('Only one file is allowed', 400))
        }
    
        if (!width || !height || isNaN(Number(width)) || isNaN(Number(height))) {
            logger.error('Validation Error: Width and height are required and must be valid numbers', { code: 400, data: request.body })
            return next(new ApplicationError('Validation Error: Width and height are required and must be valid numbers', 400))
        }

        if (isNaN(Number(left)) || isNaN(Number(top))) {
            logger.error('Validation Error: Left and top must be valid numbers', { code: 400, data: request.body })
            return next(new ApplicationError('Validation Error: Left and top must be valid numbers', 400))
        }
    
        const parsedLeft = Number(left)
        const parsedTop = Number(top)
        const parsedWidth = Number(width)
        const parsedHeight = Number(height)
    
        if (parsedWidth <= 0 || parsedHeight <= 0) {
            logger.error('Validation Error: Width and height must be positive numbers', { code: 400, data: request.body })
            return next(new ApplicationError('Width and height must be positive numbers', 400))
        }
    
        const file = files[0]
        const metadata = await sharp(file.buffer).metadata()

        if (!metadata.width || !metadata.height) {
            logger.error('Validation Error: Could not retrieve image dimensions', { code: 400, file: file.originalname })
            throw next(new ApplicationError('Could not retrieve image dimensions', 400))
        }

        if (parsedWidth > metadata.width || parsedHeight > metadata.height) {
            logger.error('Validation Error: Crop dimensions exceed image size', {
                code: 400,
                cropDimensions: { parsedWidth, parsedHeight },
                imageDimensions: { width: metadata.width, height: metadata.height },
            })
            throw next(new ApplicationError('Validation Error: Crop dimensions exceed image size', 400))
        }

        const cropRight = parsedLeft + parsedWidth
        const cropBottom = parsedTop + parsedHeight

        if (cropRight > metadata.width || cropBottom > metadata.height) {
            logger.error('Validation Error: Crop area is outside the image boundaries', {
                code: 400,
                cropParams: { left: parsedLeft, top: parsedTop, width: parsedWidth, height: parsedHeight },
                imageDimensions: { width: metadata.width, height: metadata.height }
            })
            throw next(new ApplicationError('Crop position exceeds image boundaries', 400))
        }

        next()
    } catch (error) {
        next(error)
    }
}
