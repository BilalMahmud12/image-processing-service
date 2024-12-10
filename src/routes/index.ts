import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.send('Image service is running')
})

export default router