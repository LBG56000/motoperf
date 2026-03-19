import Message from '../models/Message'
import { type Request, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, size } = prepareQuery(req.query)
    try {
      const messages = await Message.find()
        .select(project)
        .sort(sort)
        .limit(size)
      res.status(200).json({ messages })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default router
