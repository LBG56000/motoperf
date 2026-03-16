import type { IUser } from '../types/user'
import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    ridingStartYear: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    userType: {
      type: String,
      enum: ['beginner', 'confirmed', 'expert', 'other'],
      default: 'beginner',
    },

  },
  { timestamps: true },
)

export default model<IUser>('User', userSchema)
