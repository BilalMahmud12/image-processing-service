import { ApplicationError } from './ApplicationError'
import type { Request, NextFunction, Response } from 'express'
import { imageConfig } from '../config/imageConfig'

export const validateImageTransformInput = (
    request: Request, 
    response: Response, 
    next: NextFunction
) => {
    const { type } = request.body
    const files = request.files as Express.Multer.File[]

    if (!type) {
        throw new ApplicationError('The type field is required', 400)
    }

    if (!files || files.length === 0) {
        throw new ApplicationError('No files uploaded', 400)
    }

    if (!imageConfig[type]) {
        throw new ApplicationError('The provided image type is invalid', 400)
    }

    next()
}
