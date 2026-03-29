import User from '../models/User'
import { authenticateToken } from '../utils/auth'
import { type Request, Response, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  authenticateToken,
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: Response) => {
    const { project } = prepareQuery(req.query)
    const { id } = req.user as { id: string }

    try {
      const users = await User.findById(id).select(project)
      res.status(200).json({ users })
    } catch (error) {
      console.error('Error accessing user route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.get('/count', async (req: Request, res: Response) => {
  try {
    const totalUsers: number = await User.countDocuments()
    res.status(200).json(totalUsers)
  } catch (error) {
    console.error('Error accessing user route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
