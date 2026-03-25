import Message from '../models/Message'
import { connectToMongo } from '.'
import Post from '../models/Post'
import User from '../models/User'

const seedMessage = async () => {
  await connectToMongo()
  await Message.deleteMany({})

  const post1 = await Post.findOne({ id: 'p-001' })
  const user1 = await User.findOne({ id: 'u-002' })

  if (!user1) {
    throw new Error('Missing seeded data')
  }

  await Message.insertMany([
    {
      id: 'm-001',
      content: 'Pense aussi au coût de l’assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [post1?._id],
      referenceModel: 'Post',
      user: user1._id
    }
  ])

  const message = await Message.findOne({ id: 'm-001' })
  await Message.insertMany([
    {
      id: 'm-002',
      content: 'Réponse au cout de l\'assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [message?._id],
      referenceModel: 'Message',
      user: user1._id
    },
    {
      id: 'm-003',
      content: 'Deuxième Réponse au cout de l\'assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [message?._id],
      referenceModel: 'Message',
      user: user1._id
    }
  ])
  console.log('Message seeding')

  const messages = await Message.find()
  console.log('Seeded messages:', messages)
}

export default seedMessage
