import { Request, Router } from 'express'
import { prepareQuery, ReqQuery } from '../utils/find'
import Post from '../models/Post'
import { IPost } from '../types/post'
import Message from '../models/Message'
import Brand from '../models/Brand'
import User from '../models/User'
import Category from '../models/Category'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: any) => {
    const { project, sort, deep, limit, filter } = prepareQuery(req.query)
    try {
      let query = Post.find(filter).select(project).sort(sort).limit(limit)
      if (deep) {
        query = query.populate('user').populate('brand').populate('category')
      }
      const posts: Array<IPost> = await query
      res.status(200).json({ posts })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.get(
  '/:id/responses',
  async (
    req: Request<{ id: string }, unknown, unknown, ReqQuery>,
    res: any,
  ) => {
    const { project, sort, deep, limit } = prepareQuery(req.query)
    try {
      const post = await Post.findOne({ _id: req.params.id })
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }
      let query = Message.find({
        // TODO: mettre filter
        reference: post._id,
        referenceModel: 'Post',
      })
        .select(project)
        .sort(sort)
        .limit(limit)

      if (deep) {
        query = query.populate('user')
      }

      const messages = await query

      res.json({ messages })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.post('/add-view', async (req, res) => {
  const { filter } = prepareQuery(req.query)
  try {
    await Post.updateOne(
      { _id: filter.id },
      { $inc: { views: 1 } }
    );
    res.status(204).json()
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body
    const brand = await Brand.findOne({ name: body.brand })
    const category = await Category.findOne({ name: body.category })
    let user = await User.findOne({ firstname: 'MotoCenter' })
    if (body.isNewMotoComment === false) {
      user = await User.findOne({ _id: body.user })
    }

    if (!brand || !category || !user) {
      return res.status(500).json({ error: 'Internal server error' })
    }
    const postCreated = await Post.insertOne({
      title: body.title,
      content: body.content,
      user: user,
      brand: brand,
      category: category,
      image: body.url
    })
    res.status(201).json({ _id: postCreated._id })
  } catch (error) {
    console.log('TETTTT2')
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/', async (req, res) => {
  const { filter } = prepareQuery(req.query)
  try {
    const body = req.body
    const brand = await Brand.findOne({ name: body.brand })
    const category = await Category.findOne({ name: body.category })
    const user = await User.findOne({ _id: body.user })

    if (!brand || !category || !user) {
      return res.status(500).json({ error: 'Internal server error' })
    }

    const updatePost = await Post.findByIdAndUpdate(
      filter.id,
      {
        title: body.title,
        content: body.content,
        category: category._id,
        user: user._id,
        brand: brand._id,
        url: body.url,
      },
    )
    if (!updatePost) {
      return res.status(500).json()
    }
    res.status(204).json({ error: 'Internal server error' })
  } catch (error) {
    console.error('Error updating motorcycle:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
