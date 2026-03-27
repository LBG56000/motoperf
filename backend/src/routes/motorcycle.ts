import Motorcycle from '../models/Motorcycle'
import { type Request, Response, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: Response) => {
    const { project, sort, limit, filter } = prepareQuery(req.query)
    try {
      const motorcycles = await Motorcycle.find()
        .where(filter)
        .select(project)
        .sort(sort)
        .limit(limit)
        .populate('brand')
      res.status(200).json({ motorcycles })
    } catch (error) {
      console.error('Error accessing motorcycle route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.post('/', async (req: Request, res: Response) => {
  try {
    const newMotorcycle = new Motorcycle(req.body)
    const savedMotorcycle = await newMotorcycle.save()
    res.status(201).json(savedMotorcycle)
  } catch (error) {
    console.error('Error creating motorcycle:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/count', async (req: Request, res: Response) => {
  try {
    const totalMotorcycles: number = await Motorcycle.countDocuments()
    res.status(200).json(totalMotorcycles)
  } catch (error) {
    console.error('Error accessing motorcycle route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedMotorcycle = await Motorcycle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate('brand')
    if (!updatedMotorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' })
    }
    res.status(200).json({ motorcycle: updatedMotorcycle })
  } catch (error) {
    console.error('Error updating motorcycle:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
