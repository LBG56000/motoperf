import { Router } from 'express'
import userRoutes from './user'
import brandRoutes from './brand'

const router = Router()

router.use('/users', userRoutes)
router.use('/brands', brandRoutes)
router.use('/messages', brandRoutes)

export default router
