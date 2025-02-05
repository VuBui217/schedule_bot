/**
 * This file is to handle MongoDb connection
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
      });
      console.log("✅ Bot connected to MongoDB");
    } catch (error) {
      console.error("❌ Bot MongoDB connection error:", error);
      process.exit(1); // Exit if unable to connect
    }
  }
}
