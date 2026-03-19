import { Router } from 'express'
import userRoutes from './user'
import brandRoutes from './brand'
import messageRoutes from './message'
import motorcycleRoutes from './motorcycle'

const router = Router()

router.use('/users', userRoutes)
router.use('/brands', brandRoutes)
router.use('/messages', messageRoutes)
router.use('/motorcycles', motorcycleRoutes)

export default router
