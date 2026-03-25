
import { connectToMongo } from '.'
import Category from '../models/Category'

const seedCategory = async () => {
  await connectToMongo()
  await Category.deleteMany({})

  await Category.insertMany([
    {
      id: 'c-001',
      name: 'Réparation',
      icon: 'wrench'
    },
    {
      id: 'c-002',
      name: 'Entretien',
      icon: 'cog'
    },
    {
      id: 'c-003',
      name: 'Course',
      icon: 'motorbike'
    },
    {
      id: 'c-004',
      name: 'Opinion',
      icon: 'megaphone'
    }
  ])
}

export default seedCategory
