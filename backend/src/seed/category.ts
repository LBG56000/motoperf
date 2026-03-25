
import { connectToMongo } from '.'
import Category from '../models/Category'

const seedCategory = async () => {
  await connectToMongo()
  await Category.deleteMany({})

  await Category.insertMany([
    {
      name: 'Réparation',
      icon: 'wrench'
    },
    {
      name: 'Entretien',
      icon: 'cog'
    },
    {
      name: 'Course',
      icon: 'motorbike'
    },
    {
      name: 'Opinion',
      icon: 'megaphone'
    }
  ])

  console.log('Categories seeding')
}

export default seedCategory
