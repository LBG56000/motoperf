import { Router } from 'express'
import userRoutes from './user'
import brandRoutes from './brand'
import messageRoutes from './message'
import motorcycleRoutes from './motorcycle'
import postRoutes from './post'
import categoryRoutes from './category'

const router = Router()

router.use('/users', userRoutes)
router.use('/brands', brandRoutes)
router.use('/messages', messageRoutes)
router.use('/motorcycles', motorcycleRoutes)
router.use('/posts', postRoutes)
router.use('/categories', categoryRoutes)
router.use('/brand', brandRoutes)

export default router
