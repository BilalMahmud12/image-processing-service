import { Router } from 'express'
import { env } from './config/env'
import { upload } from './middlewares/fileUpload'
import { validateImageUpload } from './middlewares/validateSchema'
import { handleImageTransform } from './controllers/imageTransform.controller'

const router = Router()

router.post(
    '/transform', 
    upload.array('files', env.maxUploadLimit),
    (req, _, next) => {
        req.body.files = req.files || []
        next()
    },
    validateImageUpload, 
    handleImageTransform
)

export default router