import { Router } from 'express'
import { env } from './config/env'
import { upload } from './middlewares/fileUpload'
import { validateImageTransformInput } from './utils/validate'
import { handleImageTransform } from './controllers/imageTransform.controller'

const router = Router()

router.post(
    '/transform', 
    upload.array('files', env.maxUploadLimit),
    validateImageTransformInput, 
    handleImageTransform
)

export default router