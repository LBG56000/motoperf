
import { connectToMongo } from '.'
import Category from '../models/Category'

const seedCategory = async () => {
  await connectToMongo()
  await Category.deleteMany({})

  await Category.insertMany([
    {
      id: 'c-001',
      name: 'Réparation',
    },
    {
      id: 'c-002',
      name: 'Entretien',
    },
    {
      id: 'c-003',
      name: 'Course',
    },
    {
      id: 'c-004',
      name: 'Opinion'
    }
  ])
}

export default seedCategory
