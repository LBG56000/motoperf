import { connectToMongo } from "."
import Post from "../models/Post"

const seedPost = async () => {
  await connectToMongo()
  await Post.deleteMany({})

  await Post.insertMany([
    {
      id: 'p-001',
      question: 'Question 1',
      content: 'Quelle est la meilleure moto pour débuter ?',
      categoryId: 'c-001',
      userId: 'u-001',
      brandId: 'b-001',
    },
    {
      id: 'p-002',
      question: 'Question 2',
      content: 'Quelle est la meilleure marque de moto ?',
      categoryId: 'c-002',
      userId: 'u-001',
      brandId: 'b-001',
    },
  ])
}

export default seedPost