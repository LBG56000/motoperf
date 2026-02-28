import { Request, Response } from 'express'
import User from '../models/User'
import { CreateUserDto } from '../dto/user.create.dto'

const createUser = async (req: Request, res: Response) => {
  const data: CreateUserDto = req.body
  const user = await User.create(data)
  res.status(201).json(user)
}

const getUsers = async (req: Request, res: Response) => {
  const users = await User.find()
  res.json(users)
}

export default { createUser, getUsers }
