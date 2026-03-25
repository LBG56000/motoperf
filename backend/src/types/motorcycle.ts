import { IAcceleration } from "./accelerations"
import { MotorcycleCategory } from "../models/Motorcycle"

export interface IMotorcycle {
  id: string
  brandId: string
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
  is_new?: boolean
  acceleration?: IAcceleration
  speedMax?: number
  numberOfComparison?: number
  withAllFiled?: boolean
  price: number
  createdAt: string
}
