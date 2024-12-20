import type { Request, Response, NextFunction } from 'express'
import { processImageCrop } from '../services/imageService/index.service'
import logger from '../utils/logger'

export const handleImageCrop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { top, left, width, height } = req.body
        const files = req.files as Express.Multer.File[]

        const cropParams = {
            left: parseInt(left) ?? 0,
            top: parseInt(top) ?? 0,
            width: parseInt(width),
            height: parseInt(height)
        }
    
        logger.info('Start file cropping process', {
            file: files[0].originalname ?? '',
            cropParams
        })

        const result = await processImageCrop(cropParams, files[0])

        logger.info('Finished file cropping process', {
            original: files[0].originalname,
            cropParams,
            result,
        })

        res.status(200).json({
            files: result
        })
    } catch (error) {
        next(error)
    }
}
