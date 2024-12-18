import multer from 'multer'
import { env } from '../config/env'
import { imageMimeTypes } from '../config/mimeTypes'
import { ApplicationError } from '../utils/ApplicationError'

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: env.maxFileSize,
        files: env.maxUploadLimit,
    },
    fileFilter: (req, file, callback) => {
        if (imageMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new ApplicationError(`Invalid file type. Only ${imageMimeTypes.join(', ')} are allowed`, 400))
        }
    },
})