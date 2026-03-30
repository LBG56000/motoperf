import { Request, Router } from "express"
import { prepareQuery, ReqQuery } from "../utils/find"
import Post from "../models/Post"
import { IPost } from "../types/post"
import Message from "../models/Message"
import Brand from "../models/Brand"
import User from "../models/User"
import Category from "../models/Category"

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, deep, limit, filter } = prepareQuery(req.query)
    try {
      let query = Post.find(filter)
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
    const post = await Post.findOne({ _id: req.params.id })
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    const query = Message.find({
      reference: post._id,
      referenceModel: 'Post'
    })

    query.populate('user')

    const messages = await query

    res.json({ messages })
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/add-view', async (req, res) => {
  const { filter } = prepareQuery(req.query)
  try {
    const post = await Post.findOne({ _id: filter.id })
    if (!post) {
      throw new Error('Internal server error')
    }
    const views = post.views
    await Post.updateOne({ views: views }, { $inc: { views: 1 } })
    res.status(204).json()
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body
    const brand = await Brand.findOne({ _id: body.post_brand })
    const category = await Category.findOne({ _id: body.post_category })
    // TODO: a modifier dans le front et le back avec des vrai user et des vrai images
    const user = await User.findOne({ firstname: 'Alice' })

    if (!brand || !category || !user) {
      console.log(brand)
      console.log(category)
      console.log(user)
      console.log(body.post_category)
      return res.status(500).json({ error: 'Internal server error' })
    }
    const postCreated = await Post.insertOne({
      question: body.post_title,
      content: body.post_description,
      user: user,
      brand: brand,
      category: category,
      image: 'test1.png'
    })
    res.status(201).json({ id: postCreated._id })
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

//Renvoyer lors de la création l'id du post =

export default router
