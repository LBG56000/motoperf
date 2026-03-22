import { Request, Router } from "express"
import { prepareQuery, ReqQuery } from "../utils/find"
import Post from "../models/Post"
import { IPost } from "../types/post"
import Message from "../models/Message"

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, deep, limit } = prepareQuery(req.query)
    try {
      let query = Post.find()
        .select(project)
        .sort(sort)
        .limit(limit)
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

router.get('/:id/responses', async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id })
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    const messages = await Message.find({
      reference: post._id,
      referenceModel: 'Post'
    })

    res.json({ messages })
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
