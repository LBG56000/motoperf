import { Request, Router } from "express"
import { prepareQuery, ReqQuery } from "../utils/find"
import Post from "../models/Post"
import { IPost } from "../types/post"

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, deep } = prepareQuery(req.query)
    try {
      let query = Post.find()
        .select(project)
        .sort(sort)
      if (deep) {
        query = query
          .populate('user')
          .populate('brand')
          .populate('category')
      }
      const posts: Array<IPost> = await query
      res.status(200).json({ posts })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default router
