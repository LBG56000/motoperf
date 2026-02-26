import app from "./app"
import connectDB from "./config/db"
import 'dotenv/config'

connectDB()

app.listen(process.env.PORT_BACK, () => {
  console.log(`Server running on http://localhost:${process.env.PORT_BACK}`)
})