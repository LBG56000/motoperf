import { Request, Response } from "express"
import User from "../models/User"

const createUser = async (req: Request, res: Response) => {
    const user = await User.create(req.body)
    res.status(201).json(user)
}

const getUsers = async (req: Request, res: Response) => {
    const users = await User.find()
    res.json(users)
}

export default {createUser, getUsers}