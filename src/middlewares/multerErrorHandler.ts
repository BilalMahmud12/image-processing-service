import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'

export const multerErrorHandler = (
    error: any, 
    request: Request, 
    response: Response, 
    next: NextFunction
): Response | void => {
    if (error instanceof MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return response.status(400).json({ error: 'File size too large. Maximum 5MB per file' })
                
            case 'LIMIT_FILE_COUNT': 
                return response.status(400).json({ error: 'Too many files. Maximum 10 files allowed' })

            default:
                return response.status(400).json({ error: error.message })
        }
    }
    
    else if (error.message === 'Invalid file type. Only JPEG, PNG, and WebP are allowed') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
