import { model, Schema } from "mongoose";
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
    categoryId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    brandId: {
        type: String,
        required: true
    }
})

export default model<IPost>('Post', postSchema)