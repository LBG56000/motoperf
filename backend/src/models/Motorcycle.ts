import type { IMotorcycle } from '../types/motorcycle'
import { Schema, model } from 'mongoose'

const motorcycleSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  brandId: {
    type: Number,
    require: true,
  },
  engine_size: {
    type: Number,
    required: true,
  },
  model: {
    type: String,
    require: true,
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
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<IMotorcycle>('Motorcycle', motorcycleSchema)
