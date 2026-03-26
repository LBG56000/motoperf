import User from '../models/User'
import { connectToMongo } from '.'

const seedUser = async () => {
  await connectToMongo()
  await User.deleteMany({})

  await User.insertMany([
    {
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
}

export default seedUser
