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
      pseudo: 'AliceD',
      email: 'alice.dupont@motocenter.com',
      password: 'hashed_password_1',
      isAdmin: true,
      userType: 'expert',
      ridingStartYear: 2005,
      createdAt: new Date(),
      image: 'test2.png'
    },
    {
      id: 'u-002',
      firstname: 'Bob',
      lastname: 'Martin',
      pseudo: 'BobM',
      email: 'bob.martin@motocenter.com',
      password: 'hashed_password_2',
      userType: 'confirmed',
      ridingStartYear: 2015,
      createdAt: new Date(),
      image: 'test1.png'
    },
    {
      id: 'u-003',
      firstname: 'Clara',
      lastname: 'Bernard',
      pseudo: 'ClaraB',
      email: 'clara.bernard@motocenter.com',
      password: 'hashed_password_3',
      userType: 'beginner',
      ridingStartYear: 2023,
      createdAt: new Date(),
      image: 'test4.png'
    },
    {
      id: 'u-004',
      firstname: 'David',
      lastname: 'Leroy',
      pseudo: 'DavidL',
      email: 'david.leroy@motocenter.com',
      password: 'hashed_password_4',
      userType: 'confirmed',
      ridingStartYear: 2018,
      createdAt: new Date(),
      image: 'test3.png'
    },
    {
      id: 'u-005',
      firstname: 'Emma',
      lastname: 'Petit',
      pseudo: 'EmmaP',
      email: 'emma.petit@motocenter.com',
      password: 'hashed_password_5',
      userType: 'other',
      createdAt: new Date(),
      image: 'test4.png'
    },
  ])

  console.log('User seeding')

  const users = await User.find()
  console.log('Seeded users:', users)
}

export default seedUser
