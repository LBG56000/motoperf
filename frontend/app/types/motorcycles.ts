import type { IBrand } from './brand'

import type { IAcceleration } from './accelerations'

export enum MotorcycleCategory {
  SPORTSBIKE = 'sportsbike',
  ROADSTER = 'roadster',
  ADVENTURE = 'adventure',
  CUSTOM = 'custom',
  TOURING = 'touring',
  SPORT_TOURING = 'sport-touring',
  SUPERMOTARD = 'supermotard'
}

export interface IMotorcycle {
  _id: string
  brand: IBrand
  name: string
  year: number
  category: MotorcycleCategory
  engine_size: number
  horsePower: number
  torque: number
  weight: number
  consumption: number
  soundLink?: string
  imageUrl?: string
  isAvailableA2?: boolean
  is_public?: boolean
  acceleration?: IAcceleration
  speedMax?: number
  numberOfComparison?: number
  withAllField?: boolean
  price: number
  createdAt: string
  post: string
}
