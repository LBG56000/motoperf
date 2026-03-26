export interface IRide {
  _id: string
  title: string
  description: string
  geom: any
  color: string
  duration: number
  distance: number
  start_town: string
  end_town: string
  ride_type: string
  picture: string
  like: number
  create_date: string
}

export interface IGeoJSON {
  type: string
  features: {
    type: string
    geometry: {
      type: string
      coordinates: number[][]
    }
    properties: any
  }[]
}

export interface IFilterObject {
  distance: number[]
  duration: number[]
  title: string
  type: string[]
  startTown: string[]
  endTown: string[]
}
