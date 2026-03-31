import Message from '../models/Message'
import { type Request, Response, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res) => {
    const { project, sort, limit, filter } = prepareQuery(req.query)
    try {
      const messages = await Message.find(filter)
        .select(project)
        .sort(sort)
        .limit(limit)
      res.status(200).json({ messages })
    } catch (error) {
      console.error('Error accessing message route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.get('/:id/responses', async (req, res) => {
  try {
    const message = await Message.findOne({ id: req.params.id })
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }
    const query = Message.find({
      reference: message._id,
      referenceModel: 'Message'
    })

    query.populate('user')

    const messages = await query

    res.json({ messages })
  } catch (error) {
    console.error('Error accessing message route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


router.post('/', async (req: Request, res: Response) => {
  try {
    const message = new Message(req.body)
    await message.save()
    res.status(201).json(message)
  }catch (error) {
    console.error('Error creating message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router