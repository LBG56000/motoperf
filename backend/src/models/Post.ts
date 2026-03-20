import { model, Schema, Types } from "mongoose";
import type { IPost } from "../types/post";

const postSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  question: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: Types.ObjectId,
    ref: "Category",
    required: true
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  },
  brand: {
    type: Types.ObjectId,
    ref: "Brand",
    required: true
  }
})

export default model<IPost>('Post', postSchema)