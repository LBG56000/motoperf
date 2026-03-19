import { Request, Router } from "express"
import { prepareQuery, ReqQuery } from "../utils/find"
import Post from "../models/Post"

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, size } = prepareQuery(req.query)
    try {
      const posts = await Post.find()
        .select(project)
        .sort(sort)
        .limit(size)
      res.status(200).json({ posts })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default router
