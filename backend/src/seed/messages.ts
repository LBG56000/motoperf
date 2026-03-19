import Message from '../models/Message'
import { connectToMongo } from '.'

const seedMessage = async () => {
  await connectToMongo()
  await Message.deleteMany({})

  await Message.insertMany([
    // Publications
    {
      id: 'm-001',
      content: 'Quelle est la meilleure moto pour débuter ?',
      description: 'Question générale sur les motos adaptées aux débutants',
      like: 12,
      dislike: 1,
      parentId: null,
    },
    {
      id: 'm-002',
      content: 'Honda ou Yamaha pour un usage quotidien ?',
      description:
        'Comparaison entre deux marques populaires pour un usage journalier',
      like: 8,
      dislike: 0,
      parentId: null,
    },

    // Réponses à m-001
    {
      id: 'm-003',
      content: 'Je te conseille une Honda CB500, très fiable 👍',
      like: 5,
      dislike: 0,
      isRep: true,
      parentId: 'm-001',
    },
    {
      id: 'm-004',
      content: 'Yamaha MT-07 est top aussi, plus fun 😄',
      like: 6,
      dislike: 1,
      isRep: true,
      parentId: 'm-001',
    },

    // Réponses à m-002
    {
      id: 'm-005',
      content: 'Pour débuter, évite les trop grosses cylindrées',
      like: 10,
      dislike: 0,
      isPublicationResponse: true,
      parentId: 'm-002',
    },
    {
      id: 'm-006',
      content: 'Pense aussi au coût de l’assurance',
      like: 7,
      dislike: 0,
      isPublicationResponse: true,
      parentId: 'm-002',
    },

    // Messages indépendants
    {
      id: 'm-007',
      content: 'Quelqu’un a testé la nouvelle BMW ?',
      description: 'Recherche d’avis utilisateur',
      like: 3,
      dislike: 0,
      parentId: null,
    },
    {
      id: 'm-008',
      content: 'Les motos électriques valent le coup ?',
      description: 'Question sur les alternatives écologiques',
      like: 4,
      dislike: 2,
      parentId: null,
    },

    // Débat (thread sur m-008)
    {
      id: 'm-009',
      content: 'Franchement Yamaha c’est surcoté',
      description: 'Opinion critique sur la marque Yamaha',
      like: 2,
      dislike: 5,
      parentId: 'm-008',
    },
    {
      id: 'm-010',
      content: 'Pas d’accord, jamais eu de problème avec la mienne',
      description: 'Réponse défensive basée sur expérience personnelle',
      like: 6,
      dislike: 1,
      isRep: true,
      parentId: 'm-009',
    },
  ])
  console.log('Message seeding')

  const messages = await Message.find()
  console.log('Seeded messages:', messages)
}

export default seedMessage
