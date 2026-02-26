import mongoose from "mongoose";
import seedUser from "./user.seed";

const connectToMongo = async () => {
    return await mongoose.connect(process.env.MONGO_URI as string)
}

const seed = async () => {
    console.log('Seeding database')
    await seedUser()
}

seed()

export {connectToMongo}