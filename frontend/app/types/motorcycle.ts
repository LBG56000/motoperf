export interface IMotorcycle {
  id: string
  brandId: number
  engine_size: number
  model: string
  horsePower: number
  soundLink?: string
  is_new?: boolean
  time_0_100?: number
  time_100_200?: number
  time_200_300?: number
  speedMax?: number
  numberOfComparison?: number
  withAllFiled?: boolean
  year: number
  price: number
  createdAt?: Date
}
