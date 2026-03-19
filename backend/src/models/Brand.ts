import type { IBrand } from '../types/brand'
import { Schema, model } from 'mongoose'

const brandSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  marque: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<IBrand>('Brand', brandSchema)
