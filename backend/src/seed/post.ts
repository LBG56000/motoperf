import { connectToMongo } from "."
import Brand from "../models/Brand"
import Category from "../models/Category"
import Post from "../models/Post"
import User from "../models/User"

const seedPost = async () => {
  await connectToMongo()
  await Post.deleteMany({})

  const user = await User.findOne({ firstname: 'Alice' })
  const category1 = await Category.findOne({ name: 'Réparation' })
  const category2 = await Category.findOne({ name: 'Entretien' })

  const brand = await Brand.findOne({ name: 'Honda' })

  if (!user || !category1 || !category2 || !brand) {
    throw new Error('Missing seeded data')
  }

  await Post.insertMany([
    {
      question: 'Quelle est la meilleure moto pour débuter ?',
      content: 'Je cherche une une bonne moto pour commencer, j\'ai vu Malo, Loris, Sloan et Cyril. Ils m\'ont donné envie.',
      category: category1._id,
      user: user._id,
      brand: brand._id,
      views: 12,
      image: 'test1.png'
    },
    {
      question: 'Quelle est la meilleure marque de moto ?',
      content: 'Des personnes diront que c\'est Suzuky ou Honda, mais vraiment c\'est quoi la meilleure ? ',
      category: category2._id,
      user: user._id,
      brand: brand._id,
      image: 'test2.png'
    },
  ])
}

export default seedPost