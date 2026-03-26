import Picture from '../models/Picture'
import { connectToMongo } from '.'

const seedPicture = async () => {
  await connectToMongo()
  await Picture.deleteMany({})

  console.log('Picture seeding')
}

export default seedPicture
