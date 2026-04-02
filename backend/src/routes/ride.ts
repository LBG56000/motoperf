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

router.patch('/:id/like', async (req: Request<{ id: string }>, res: any) => {
  const { userId } = req.body
  const rideId = req.params.id

  if (!userId) return res.status(400).json({ error: 'ID requis' })

  try {
    const ride = await Ride.findById(rideId)
    if (!ride) return res.status(404).json({ error: 'Balade introuvable' })

    const hasLiked = ride.liked_id.includes(userId.toString())

    const update = hasLiked
      ? { $pull: { liked_id: userId }, $inc: { like: -1 } }
      : { $addToSet: { liked_id: userId }, $inc: { like: 1 } }

    const updatedRide = await Ride.findByIdAndUpdate(rideId, update, {
      new: true,
    })

    if (!updatedRide)
      return res.status(404).json({ error: 'Erreur mise à jour' })

    res.status(200).json({
      like: updatedRide.like,
      isLiked: !hasLiked,
    })
  } catch (error: any) {
    console.error('ERREUR MONGODB:', error.message)
    res.status(500).json({ error: 'Erreur serveur', details: error.message })
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
        imageLink,
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
        image_link: imageLink,
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
