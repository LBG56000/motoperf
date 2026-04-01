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

  if (!userId) {
    return res.status(400).json({ error: "L'ID de l'utilisateur est requis" })
  }

  try {
    const ride = await Ride.findById(req.params.id)

    if (!ride) {
      return res.status(404).json({ error: 'Balade introuvable' })
    }

    const hasLiked = ride.liked_id.includes(userId)
    let update
    if (hasLiked) {
      update = {
        $pull: { liked_id: userId },
        $inc: { like: -1 },
      }
    } else {
      update = {
        $addToSet: { liked_id: userId },
        $inc: { like: 1 },
      }
    }

    const updatedRide = await Ride.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })

    res.status(200).json({
      like: updatedRide?.like,
      isLiked: !hasLiked,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur pendant l’opération de like' })
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
