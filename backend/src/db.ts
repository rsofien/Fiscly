import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/fiscly"

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL)
    console.log("✓ MongoDB connected")
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error)
    process.exit(1)
  }
}
