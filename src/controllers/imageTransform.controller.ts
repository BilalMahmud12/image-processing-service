import type { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'
import { convertToWebP, resizeImage } from '../services/imageProcessor'
import { imageConfig } from '../config/imageConfig'

export async function handleImageTransform(request: Request, response: Response, next: NextFunction) {
    try {
        const { type } = request.body
        const file = request.file

        if (!file) {
            const error = new Error('No file uploaded.')
            //error['status'] = 400;
            throw error;
        }

        if (!['game', 'promotion'].includes(type)) {
            const error = new Error('Invalid image type. Allowed types: game, promotion.');
            //error['status'] = 400;
            throw error;
        }

        const originalBuffer = await convertToWebP(file.buffer)

        let variations: Record<string, Buffer> = {};
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
            );
        }

        response.status(200).json({
            original: originalBuffer.toString('base64'),
            variations: Object.fromEntries(
                Object.entries(variations).map(([key, buffer]) => [key, buffer.toString('base64')])
            ),
        })

    } catch (error) {
        next(error)
    }
}