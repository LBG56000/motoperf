import Message from '../models/Message'
import { connectToMongo } from '.'

const seedMessage = async () => {
  await connectToMongo()
  await Message.deleteMany({})

  await Message.insertMany([
    // Réponses à m-001
    {
      id: 'm-003',
      content: 'Je te conseille une Honda CB500, très fiable 👍',
      like: 5,
      dislike: 0,
      isRep: true,
      reference: 'post::m-001',
    },
    {
      id: 'm-004',
      content: 'Yamaha MT-07 est top aussi, plus fun 😄',
      like: 6,
      dislike: 1,
      isRep: true,
      reference: 'post::m-001',
    },

    // Réponses à m-002
    {
      id: 'm-005',
      content: 'Pour débuter, évite les trop grosses cylindrées',
      like: 10,
      dislike: 0,
      isPublicationResponse: true,
      reference: 'message::m-002',
    },
    {
      id: 'm-006',
      content: 'Pense aussi au coût de l’assurance',
      like: 7,
      dislike: 0,
      isPublicationResponse: true,
      reference: 'message::m-002',
    },
  ])
  console.log('Message seeding')

  const messages = await Message.find()
  console.log('Seeded messages:', messages)
}

export default seedMessage
