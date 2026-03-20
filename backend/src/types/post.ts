import { IBrand } from "./brand";
import { ICategory } from "./category";
import { IUser } from "./user";

export interface IPost {
    id: number,
    question: string,
    content: string,
    category: ICategory,
    user: IUser,
    brand: IBrand
}