import { IBrand } from './brand'

import { IAcceleration } from './accelerations'

export interface IMotorcycle {
  id: string
  name: string
  brand: IBrand
  createdAt: string
  engine_size: number
  horsePower: number
  torque: number
  weight: number
  consumption: number
  soundLink?: string
  imageUrl?: string
  is_public?: boolean
  acceleration?: IAcceleration
  speedMax?: number
  numberOfComparison?: number
  withAllFiled?: boolean
  year: number
  price: number
}
