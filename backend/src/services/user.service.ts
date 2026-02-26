import userRepository from "../repositories/user.repository"

/**Logique métier */


const createUserService = async (data:any) => {
    return userRepository.createUser(data)
}

const getAllUsersService = async () => {
    return userRepository.getAllUsers()
}

export default {createUserService,getAllUsersService}