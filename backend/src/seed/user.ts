import User from '../models/User'
import { connectToMongo } from '.'

const seedUser = async () => {
  await connectToMongo()
  await User.deleteMany({})

  await User.insertMany([
    {
      id: 'u-001',
      firstname: 'Alice',
      lastname: 'Dupont',
      email: 'alice.dupont@motocenter.com',
      password: 'hashed_password_1',
      isAdmin: true,
      userType: 'expert',
      ridingStartYear: 2005,
    },
    {
      id: 'u-002',
      firstname: 'Bob',
      lastname: 'Martin',
      email: 'bob.martin@motocenter.com',
      password: 'hashed_password_2',
      userType: 'confirmed',
      ridingStartYear: 2015,
    },
    {
      id: 'u-003',
      firstname: 'Clara',
      lastname: 'Bernard',
      email: 'clara.bernard@motocenter.com',
      password: 'hashed_password_3',
      userType: 'beginner',
      ridingStartYear: 2023,
    },
    {
      id: 'u-004',
      firstname: 'David',
      lastname: 'Leroy',
      email: 'david.leroy@motocenter.com',
      password: 'hashed_password_4',
      userType: 'confirmed',
      ridingStartYear: 2018,
    },
    {
      id: 'u-005',
      firstname: 'Emma',
      lastname: 'Petit',
      email: 'emma.petit@motocenter.com',
      password: 'hashed_password_5',
      userType: 'other',
    },
  ])

  console.log('User seeding')

  const users = await User.find()
  console.log('Seeded users:', users)
}

export default seedUser
