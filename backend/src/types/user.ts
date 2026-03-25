export interface IUser {
  id: string
  firstname: string
  lastname: string
  pseudo: string
  email: string
  isAdmin: boolean
  password: string
  ridingStartYear?: number
  createdAt: Date
  userType: 'beginner' | 'confirmed' | 'expert' | 'other'
  idMoto: string,
  image: string
}
