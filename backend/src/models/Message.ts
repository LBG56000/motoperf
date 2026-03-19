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
    isPublicationResponse: {
      type: Boolean,
    },
    parentId: {
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

messageSchema.pre('validate', function () {
  const hasUser = !!this.isPublicationResponse
  const hasMotorcycle = !!this.isRep

  if (hasUser && hasMotorcycle) {
    throw new Error('A message must not have isPublicationResponse AND isRep')
  }
})

export default model<IMessage>('Message', messageSchema)
