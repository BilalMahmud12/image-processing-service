import { Router } from 'express'
import { env } from './config/env'
import { upload } from './middlewares/fileUpload'
import { validateImageTransformInput, validateImageCropInput } from './utils/validate'
import { handleImageTransform } from './controllers/imageTransform.controller'
import { handleImageCrop } from './controllers/imageCrop.controller'

const router = Router()

router.post(
    '/transform', 
    upload.array('files', env.maxUploadLimit),
    validateImageTransformInput, 
    handleImageTransform
)

router.post(
    '/crop',
    upload.array('files', env.maxUploadLimit),
    validateImageCropInput,
    handleImageCrop
)

export default router