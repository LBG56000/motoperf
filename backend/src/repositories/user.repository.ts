import User from "../models/User"

const createUser = (data: any)=>{
    return User.create(data)
}

const getAllUsers = () => {
    return User.find()
}

export default {createUser,getAllUsers}