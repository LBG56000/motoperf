import { CreateUserDto } from '../dto/user.create.dto'
import User from '../models/User'

const createUser = (data: CreateUserDto): Promise<CreateUserDto> => {
  return User.create(data)
}

const getAllUsers = () => {
  return User.find()
}

export default { createUser, getAllUsers }
