import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'

export const multerErrorHandler = (error: any, request: Request, response: Response, next: NextFunction): Response | void => {
    if (error instanceof MulterError) {
        // Handle Multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return response.status(400).json({ error: 'File size too large. Maximum 5MB per file.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return response.status(400).json({ error: 'Too many files. Maximum 10 files allowed.' });
        }
        return response.status(400).json({ error: error.message });
    } else if (error.message === 'Invalid file type. Only JPEG, PNG, and WebP are allowed.') {
        // Handle custom file type validation error
        return response.status(400).json({ error: error.message });
    }

    // Pass other errors to the global error handler
    next(error);
};
