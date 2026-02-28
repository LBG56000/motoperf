import { CreateUserDto } from '../dto/user.create.dto'
import userRepository from '../repositories/user.repository'

/**Logique métier */

const createUserService = async (data: CreateUserDto) => {
  return userRepository.createUser(data)
}

const getAllUsersService = async () => {
  return userRepository.getAllUsers()
}

export default { createUserService, getAllUsersService }
