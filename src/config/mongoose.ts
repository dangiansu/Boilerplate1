import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoURI =
  process.env.MONGO_URI ||
  'mongodb+srv://ansuditpathsolutions:l2KxMlNVT51L913N@cluster0.gef34ux.mongodb.net/TestDB'

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB
