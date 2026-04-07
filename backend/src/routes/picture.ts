import Picture from '../models/Picture'
import { type Request, Router } from 'express'
import { prepareQuery, type ReqQuery } from '../utils/find'
import { IPictureBody } from '../types/picture.js'

const router = Router()
router.get(
  '/',
  async (req: Request<unknown, unknown, unknown, ReqQuery>, res: any) => {
    const { project, sort, limit, filter } = prepareQuery(req.query)
    try {
      const pictures = await Picture.find(filter)
        .select(project)
        .sort(sort)
        .limit(limit)
      res.status(200).json({ pictures })
    } catch (error) {
      console.error('Error accessing picture route:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
)

router.post(
  '/',
  async (req: Request<unknown, unknown, IPictureBody, ReqQuery>, res: any) => {
    try {
      const { title, image_link } = req.body

      const newPicture = new Picture({
        title: title,
        image_link: image_link,
      })

      const savedPicture = await newPicture.save()

      res.status(201).json({
        message: 'Balade créée avec succès',
        picture: savedPicture,
      })
    } catch (error) {
      console.error('Error creating picture:', error)
      res.status(400).json({
        error: 'Erreur lors de la création de la balade',
        details: error,
      })
    }
  },
)

export default router
