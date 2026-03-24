import type { IAcceleration } from "./accelerations"

export interface IMotorcycle {
  id: string
  name: string
  brandId: string
  createdAt: string
  year: number
  price: number
  horsePower: number
  torque: number
  weight: number
  engine_size: number
  consumption: number
  acceleration?: IAcceleration
  speedMax?: number
  soundLink?: string
  imageUrl?: string
  is_new?: boolean
  numberOfComparison?: number
  withAllFiled?: boolean
}
