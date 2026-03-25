import type { IBrand } from "./brand";
import type { ICategory } from "./category";
import type { IMessage } from "./messages";
import type { IUser } from "./users";

export interface IPost {
    _id: string,
    question: string,
    content: string,
    category: ICategory,
    user: IUser,
    brand: IBrand,
    createdAt: string,
    views: string,
    responses: IMessage[],
    image: string
}