import { InferSchemaType, Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
)

type User = InferSchemaType<typeof userSchema>

export default model<User>('User', userSchema)
