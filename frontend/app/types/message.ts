import type { IUser } from "./users"

export interface IMessage {
  id: string
  content: string
  description: string | null
  like: number
  dislike: number
  isRep: boolean
  motorcycleId: boolean | null
  user: IUser
  createAt: string
}