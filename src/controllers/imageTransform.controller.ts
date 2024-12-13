import type { Request, Response, NextFunction } from 'express'
import { ApplicationError } from '../utils/ApplicationError'
import logger from '../utils/logger'
import multer from 'multer'
import { convertToWebP, resizeImage } from '../services/imageProcessor'
import { imageConfig } from '../config/imageConfig'

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
    fileFilter: (req, file, callback) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true)
        } else {
            callback(new ApplicationError('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400))
        }
    },
})

export const handleImageTransform = [
    upload.array('files', imageConfig.maxUploadLimit),
    async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { type } = request.body
            const files = request.files as Express.Multer.File[]

            if (!type) {
                throw new ApplicationError('The "type" field is required', 400)
            }
    
            if (!files || files.length === 0) {
                throw new ApplicationError('No files uploaded', 400)
            }
    
            if (!['game', 'promotion'].includes(type)) {
                throw new ApplicationError('The provided image type is invalid', 400)
            }

            logger.info('start processing images...', {
                files
            })
    
            const results = await Promise.all(
                files.map(async (file) => {
                  
                    const originalBuffer = await convertToWebP(file.buffer)
    
                    let variations: Record<string, Buffer> = {}
                    if (type === 'game') {
                        variations.thumbnail = await resizeImage(
                            originalBuffer,
                            imageConfig.game.thumbnail.width,
                            imageConfig.game.thumbnail.height
                        );
                    } else if (type === 'promotion') {
                        variations.resized = await resizeImage(
                            originalBuffer,
                            imageConfig.promotion.resized.width,
                            imageConfig.promotion.resized.height
                        )
                    }
    
                    return {
                        original: originalBuffer.toString('base64'),
                        variations: Object.fromEntries(
                            Object.entries(variations).map(([key, buffer]) => [key, buffer.toString('base64')])
                        ),
                    }
                })
            )
    
            logger.info('finished processing requested images...', {
                results
            })
            response.status(200).json({ type, files: results })
        } catch(error) {
            const err = error as Error
            console.error('Error caught in controller:', err.message)
            next(error)
        }
    }
]