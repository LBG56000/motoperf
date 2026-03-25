import type { IAcceleration } from "./accelerations"

export interface IMotorcycle {
  id: string
  name: string
  brandId: string
  createdAt: string
  engine_size: number
  horsePower: number
  torque: number
  weight: number
  consumption: number
  soundLink?: string
  imageUrl?: string
  category: string
  isAvailableA2?: boolean
  is_new?: boolean
  acceleration?: IAcceleration
  speedMax?: number
  numberOfComparison?: number
  withAllFiled?: boolean
  year: number
  price: number
}