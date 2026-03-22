import Message from '../models/Message'
import { connectToMongo } from '.'
import Post from '../models/Post'

const seedMessage = async () => {
  await connectToMongo()
  await Message.deleteMany({})

  const post1 = await Post.findOne({ id: 'p-001' })

  await Message.insertMany([
    {
      id: 'm-001',
      content: 'Pense aussi au coût de l’assurance',
      like: 7,
      dislike: 0,
      isRep: true,
      reference: [post1?._id],
      referenceModel: 'Post',
    }
  ])
  console.log('Message seeding')

  const messages = await Message.find()
  console.log('Seeded messages:', messages)
}

export default seedMessage
