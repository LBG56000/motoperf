import express from 'express'
import routes from './routes'
import cors from 'cors'

import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.use(cookieParser())

app.use('/api/v1', routes)

export default app
