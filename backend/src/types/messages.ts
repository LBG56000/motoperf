export interface IMessage {
  id: string
  content: string
  description: string | null
  like: number
  dislike: number
  isRep: boolean
  reference: string | null
  motorcycleId: boolean | null
  userId: boolean | null
  createAt: string
}

export interface IPublicationResponse extends IMessage {
  isRep: boolean
}

export interface IMotorcycleComment extends IMessage {
  isMotorcycleComment: boolean
}
