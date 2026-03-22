import Motorcycle from '../models/Motorcycle'
import Brand from '../models/Brand'
import { connectToMongo } from '.'

const seedMotorcycles = async () => {
  console.log('Je passe dans le seed motorcycles')
  await connectToMongo()
  await Motorcycle.deleteMany({})

  // Récupérer les brands pour avoir leurs vrais _id MongoDB
  const brands = await Brand.find()
  const brandByName = (name: string) => {
    const brand = brands.find(b => b.name === name)
    if (!brand) throw new Error(`Brand "${name}" introuvable. Lancez le seed brand d'abord.`)
    return brand._id
  }

  await Motorcycle.insertMany([
    {
      id: 'm-001',
      brandId: brandByName('Honda'),
      engine_size: 599,
      name: 'CBR600RR',
      horsePower: 121,
      year: 2020,
      price: 12000,
      numberOfComparison: 3,
      withAllFiled: false,
      is_new: false,
      speedMax: 257,
    },
    {
      id: 'm-002',
      brandId: brandByName('Kawasaki'),
      engine_size: 636,
      name: 'Ninja ZX-6R',
      horsePower: 130,
      year: 2021,
      price: 11500,
      numberOfComparison: 5,
      withAllFiled: false,
      is_new: false,
      speedMax: 262,
    },
    {
      id: 'm-003',
      brandId: brandByName('Suzuki'),
      engine_size: 599,
      name: 'GSX-R600',
      horsePower: 125,
      year: 2019,
      price: 11000,
      numberOfComparison: 2,
      withAllFiled: false,
      is_new: false,
      speedMax: 250,
    },
    {
      id: 'm-004',
      brandId: brandByName('Yamaha'),
      engine_size: 599,
      name: 'YZF-R6',
      horsePower: 118,
      year: 2020,
      price: 11800,
      numberOfComparison: 4,
      withAllFiled: false,
      is_new: false,
      speedMax: 257,
    },
    {
      id: 'm-005',
      brandId: brandByName('Ducati'),
      engine_size: 955,
      name: 'Panigale V2',
      horsePower: 155,
      year: 2023,
      price: 17990,
      numberOfComparison: 8,
      withAllFiled: true,
      is_new: true,
      soundLink: 'https://example.com/sounds/panigale-v2.mp3',
      time_0_100: 3.3,
      time_100_200: 6.1,
      time_200_300: 999,
      speedMax: 270,
    },
    {
      id: 'm-006',
      brandId: brandByName('BMW'),
      engine_size: 999,
      name: 'S1000RR',
      horsePower: 210,
      year: 2024,
      price: 21990,
      numberOfComparison: 12,
      withAllFiled: false,
      is_new: true,
      time_0_100: 3.1,
      speedMax: 303,
    },
    {
      id: 'm-007',
      brandId: brandByName('Honda'),
      engine_size: 998,
      name: 'CBR1000RR-R Fireblade',
      horsePower: 217,
      year: 2024,
      price: 24599,
      numberOfComparison: 10,
      withAllFiled: false,
      is_new: true,
      time_0_100: 3.2,
      speedMax: 299,
    },
    {
      id: 'm-008',
      brandId: brandByName('Yamaha'),
      engine_size: 998,
      name: 'YZF-R1',
      horsePower: 200,
      year: 2023,
      price: 19999,
      numberOfComparison: 9,
      withAllFiled: false,
      is_new: true,
      time_0_100: 3.0,
      speedMax: 299,
    },
    {
      id: 'm-009',
      brandId: brandByName('Ducati'),
      engine_size: 1099,
      name: 'Streetfighter V4',
      horsePower: 208,
      year: 2024,
      price: 23990,
      numberOfComparison: 6,
      withAllFiled: false,
      is_new: true,
      speedMax: 290,
    },
    {
      id: 'm-010',
      brandId: brandByName('Kawasaki'),
      engine_size: 1043,
      name: 'Z H2',
      horsePower: 200,
      year: 2023,
      price: 18500,
      numberOfComparison: 7,
      withAllFiled: false,
      is_new: true,
      time_0_100: 3.4,
      speedMax: 280,
    },
    {
      id: 'm-011',
      brandId: brandByName('Honda'),
      engine_size: 599,
      name: 'CBR600RR',
      horsePower: 121,
      year: 2021,
      price: 12000,
      numberOfComparison: 3,
      withAllFiled: false,
      is_new: false,
      speedMax: 257,
    },
  ])

  console.log('Motorcycles seeded')

  const motorcycles = await Motorcycle.find()
  console.log('Seeded motorcycles:', motorcycles)
}

export default seedMotorcycles
