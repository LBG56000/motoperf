export interface IRide {
  title: string
  description: string
  color: string
  geom: GeoJSON.GeometryObject
  duration: number
  distance: number
  start_town: string
  end_town: string
  ride_type: string
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
