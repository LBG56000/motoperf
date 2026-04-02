import type { IRide } from '../types/ride'
import mongoose, { Schema, model } from 'mongoose'

const rideSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  geom: {
    type: {
      type: String,
      enum: ['FeatureCollection'],
      required: true,
      default: 'FeatureCollection',
    },
    features: [
      {
        type: {
          type: String,
          enum: ['Feature'],
          required: true,
        },
        properties: {
          type: Schema.Types.Mixed,
          default: {},
        },
        geometry: {
          type: {
            type: String,
            enum: ['LineString', 'Point', 'Polygon'],
            required: true,
          },
          coordinates: {
            type: Schema.Types.Mixed,
            required: true,
          },
        },
      },
    ],
  },
  duration: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  start_town: {
    type: String,
    required: true,
  },
  end_town: {
    type: String,
    required: true,
  },
  ride_type: {
    type: String,
    required: true,
  },
  like: {
    type: Number,
    default: 0,
  },
  liked_id: {
    type: [String],
    default: [],
  },
  image_link: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<IRide>('Ride', rideSchema)
