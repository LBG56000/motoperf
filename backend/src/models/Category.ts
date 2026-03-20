import { model, Schema } from "mongoose";
import { ICategory } from "../types/category";

const categorySchema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	}
})

export default model<ICategory>('Category', categorySchema)