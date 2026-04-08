import Ride from '../models/Ride'
import { type Request, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'
import { RideColor, ICreateRideBody } from '../types/ride'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: any) => {
    const { project, sort, limit } = prepareQuery(req.query)
    try {
      const rides = await Ride.find().select(project).sort(sort).limit(limit)
      res.status(200).json({ rides })
    } catch (error) {
      console.error('Error accessing ride route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.get('/count', async (req, res) => {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const count = await Ride.countDocuments({
      createdAt: { $gte: start, $lt: now },
    })
    res.status(200).json({ count })
  } catch (error) {
    console.error('Error counting rides:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
router.post(
  '/',
  async (
    req: Request<unknown, unknown, ICreateRideBody, ReqQuery>,
    res: any,
  ) => {
    try {
      const {
        title,
        description,
        duration,
        distance,
        startTown,
        endTown,
        rideType,
        picture,
        geom,
      } = req.body

      const colors = Object.values(RideColor)
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const newRide = new Ride({
        title: title,
        description: description,
        color: randomColor,
        geom: geom,
        duration: duration,
        distance: distance,
        start_town: startTown?.value,
        end_town: endTown?.value,
        ride_type: rideType,
        picture: picture,
      })

      const savedRide = await newRide.save()

      res.status(201).json({
        message: 'Balade créée avec succès',
        ride: savedRide,
      })
    } catch (error) {
      console.error('Error creating ride:', error)
      res.status(400).json({
        error: 'Erreur lors de la création de la balade',
        details: error,
      })
    }
  },
)

export default router
