
import { connectToMongo } from '.'
import Category from '../models/Category'

const seedCategory = async () => {
  await connectToMongo()
  await Category.deleteMany({})

  await Category.insertMany([
    {
      id: 'c-001',
      name: 'Category1',
    },
    {
      id: 'c-002',
      name: 'Category2',
    },
    {
      id: 'c-003',
      name: 'Category3',
    }
  ])
}

export default seedCategory
