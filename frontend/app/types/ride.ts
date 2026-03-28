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

export type MapItem = {
  label: string
  id: string
  icon: string
  url: string
  attribution: string
}

export interface RideResponse {
  rides: IRide[]
}

export interface ICommune {
  nom: string
  codesPostaux: string[]
}

export interface IValueCommuneSelect {
  label: string
  value: string
}

export enum RideType {
  SINUEUSE = 'Sinueuse',
  GRANDES_ROUTES = 'Grandes routes',
  LIGNES_DROITES = 'Lignes droites',
  BORD_DE_MER = 'Bord de mer',
  VALLONER = 'Valloner',
  PLAINE = 'Plaine',
  MIXTE = 'Mixte'
}
