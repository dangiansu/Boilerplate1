import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes'
import connectDB from './config/mongoose'
import errorHandler from './middlewares/errorHandler'

dotenv.config()

connectDB()

const app = express()
app.use(express.json())

app.use('/api', userRoutes)

app.use(errorHandler)

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message)
})

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection:', err.message)
})

export default app
