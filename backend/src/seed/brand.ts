import Brand from '../models/Brand'
import { connectToMongo } from '.'

const seedBrand = async () => {
  console.log('Je passe dans le seed du brand')
  await connectToMongo()
  await Brand.deleteMany({})

  await Brand.insertMany([
    {
      id: 'b-001',
      marque: 'Honda',
    },
    {
      id: 'b-002',
      marque: 'Kawasaki',
    },
    {
      id: 'b-003',
      marque: 'Suzuki',
    },
    {
      id: 'b-004',
      marque: 'Yamaha',
    },
    {
      id: 'b-005',
      marque: 'BMW',
    },
  ])
  console.log('Brand seeding')

  const brands = await Brand.find()
  console.log('Seeded brands:', brands)
}

export default seedBrand
