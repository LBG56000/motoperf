import Ride from '../models/Ride'
import { type Request, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, limit } = prepareQuery(req.query)
    try {
      const rides = await Ride.find().select(project).sort(sort).limit(limit)
      res.status(200).json({ rides })
    } catch (error) {
      console.error('Error accessing ride route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default router
