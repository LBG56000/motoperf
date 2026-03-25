import Motorcycle from '../models/Motorcycle'
import { type Request, Response, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: Response) => {
    const { project, sort, limit, filter } = prepareQuery(req.query)
    try {
      const motorcycles = await Motorcycle.find(filter)
        .select(project)
        .sort(sort)
        .limit(limit)
      res.status(200).json({ motorcycles })
    } catch (error) {
      console.error('Error accessing motorcycle route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.get('/count', async (req: Request, res: Response) => {
  try {
    const totalMotorcycles: number = await Motorcycle.countDocuments()
    res.status(200).json(totalMotorcycles)
  } catch (error) {
    console.error('Error accessing motorcycle route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
