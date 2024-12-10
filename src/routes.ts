import { Router } from 'express'
import { handleImageTransform } from './controllers/imageTransform.controller'

const router = Router()

router.get('/', (req, res) => {
    res.send('Image service is running')
})

router.post('/transform', handleImageTransform)

export default router