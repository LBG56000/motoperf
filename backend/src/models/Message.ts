import type { IMessage } from '../types/messages'
import { Schema, Types, model } from 'mongoose'

const messageSchema = new Schema(
  {
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
      type: Types.ObjectId,
      refPath: 'referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['Post', 'Message']
    },
    motorcycleId: {
      type: String,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User'
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
