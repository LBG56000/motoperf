import type { IPicture } from '../types/picture'
import { Schema, model } from 'mongoose'

const pictureSchema = new Schema({
  title: {
    type: String,
  },
  image_link: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<IPicture>('Picture', pictureSchema)
