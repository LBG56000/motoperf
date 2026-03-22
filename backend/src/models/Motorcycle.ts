import type { IMotorcycle } from '../types/motorcycle'
import { Schema, model } from 'mongoose'

const motorcycleSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  engine_size: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  horsePower: {
    type: Number,
    required: true,
  },
  soundLink: {
    type: String,
  },
  is_new: {
    type: Boolean,
  },
  time_0_100: {
    type: Number,
  },
  time_100_200: {
    type: Number,
  },
  time_200_300: {
    type: Number,
  },
  speedMax: {
    type: Number,
  },
  numberOfComparison: {
    type: Number,
    default: 0,
  },
  withAllFiled: {
    type: Boolean,
    default: false,
  },
  year: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<IMotorcycle>('Motorcycle', motorcycleSchema)
