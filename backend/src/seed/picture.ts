import Picture from '../models/Picture'
import { connectToMongo } from '.'

const seedPicture = async () => {
  console.log('Je passe dans le seed du picture')
  await connectToMongo()
  await Picture.deleteMany({})

  console.log('Picture seeding')

  const pictures = await Picture.find()
  console.log('Seeded pictures:', pictures)
}

export default seedPicture
