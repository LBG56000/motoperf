import Brand from '../models/Brand'
import { connectToMongo } from '.'

const seedBrand = async () => {
  await connectToMongo()
  await Brand.deleteMany({})

  await Brand.insertMany([
    {
      id: 'b-001',
      name: 'Honda',
    },
    {
      id: 'b-002',
      name: 'Kawasaki',
    },
    {
      id: 'b-003',
      name: 'Suzuki',
    },
    {
      id: 'b-004',
      name: 'Yamaha',
    },
    {
      id: 'b-005',
      name: 'BMW',
    },
  ])
  console.log('Brand seeding')

  const brands = await Brand.find()
  console.log('Seeded brands:', brands)
}

export default seedBrand
