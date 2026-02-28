import User from '../models/User'
import { connectToMongo } from '.'

const seedUser = async () => {
  await connectToMongo()
  await User.deleteMany({})

  await User.insertMany([
    { name: 'Test3;kdfjgn', email: 'tesfkfjgbt@jfbgfjbgtestaaa.com' },
    { name: 'Test5fkhbgf', email: 'dgkjtest@testaa5kghf.com' },
  ])
  console.log('User seeding')
  process.exit()
}

export default seedUser
