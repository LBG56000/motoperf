import { Router } from 'express'

const router = Router()
router.get('/', (req, res) => {
   console.log('Successfully accessed user route')
   res.status(200).json({ message: 'User route accessed successfully' })
})

export default router
