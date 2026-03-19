import type { IMessage } from '../types/messages'
import { Schema, model } from 'mongoose'

const messageSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    like: {
      type: Number,
      default: 0,
    },
    dislike: {
      type: Number,
      default: 0,
    },
    isRep: {
      type: Boolean,
    },
    reference: {
      type: String,
    },
    motorcycleId: {
      type: String,
    },
    userId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    validateBeforeSave: true,
  },
)

export default model<IMessage>('Message', messageSchema)
