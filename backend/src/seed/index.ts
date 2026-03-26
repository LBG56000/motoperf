import 'dotenv/config'
import mongoose from 'mongoose'
import seedUser from './user'
import seedBrand from './brand'
import seedMessage from './messages'
import seedMotorcycles from './motorcycle'
import seedPost from './post'
import seedCategory from './category'
import seedRide from './ride'
import seedPicture from './picture'

const connectToMongo = async () => {
  return await mongoose.connect(process.env.MONGO_URI as string)
}

const seed = async () => {
  try {
    console.log('Seeding database')

    await connectToMongo()

    await seedUser()
    await seedBrand()
    await seedCategory()
    await seedPicture()
    await seedRide()
    await seedPost()
    await seedMessage()
    await seedMotorcycles()

    console.log('Seeding terminé')
    process.exit(0)
  } catch (error) {
    console.error('Erreur seed ', error)
    process.exit(1)
  }
}

seed()

export { connectToMongo }
