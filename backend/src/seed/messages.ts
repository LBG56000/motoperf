import Message from '../models/Message'
import { connectToMongo } from '.'
import Post from '../models/Post'
import User from '../models/User'

const seedMessage = async () => {
  await connectToMongo()
  await Message.deleteMany({})

  const post1 = await Post.findOne({ question: 'Quelle est la meilleure moto pour débuter ?' })
  const user1 = await User.findOne({ firstname: 'Alice' })

  if (!user1 || !post1) {
    throw new Error('Missing seeded data')
  }

  await Message.insertMany([
    {
      content: 'Pense aussi au coût de l’assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [post1._id],
      referenceModel: 'Post',
      user: user1._id
    }
  ])

  const message = await Message.findOne({ content: 'Pense aussi au coût de l’assurance' })

  if (!message) {
    throw new Error('Missing seeded data')
  }

  await Message.insertMany([
    {
      content: 'Réponse au cout de l\'assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [message._id],
      referenceModel: 'Message',
      user: user1._id
    },
    {
      content: 'Deuxième Réponse au cout de l\'assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [message._id],
      referenceModel: 'Message',
      user: user1._id
    }
  ])
  console.log('Message seeding')
}

export default seedMessage
