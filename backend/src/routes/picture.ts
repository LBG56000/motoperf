import Picture from '../models/Picture'
import { type Request, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, limit, filter } = prepareQuery(req.query)
    try {
      const pictures = await Picture.find(filter)
        .select(project)
        .sort(sort)
        .limit(limit)
      res.status(200).json({ pictures })
    } catch (error) {
      console.error('Error accessing picture route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default router
