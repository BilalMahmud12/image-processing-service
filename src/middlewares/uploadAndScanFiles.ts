import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { ApplicationError } from '../utils/ApplicationError'
import { upload } from './fileUpload'
import { scanFileForViruses } from '../utils/virusScanner'
import fs from 'fs/promises'


export const uploadAndScanFiles = [
    upload.array('files', env.maxUploadLimit),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as Express.Multer.File[]

            if (!files || files.length === 0) {
                throw new ApplicationError('No files uploaded', 400)
            }

            for (const file of files) {
                try {
                    await scanFileForViruses(file.path)
                } catch (err) {
                    await Promise.all(files.map((f) => fs.unlink(f.path).catch(() => null)))
                    throw err
                }
            }

            next()
        } catch (error) {
            next(error)
        }
    }
]
