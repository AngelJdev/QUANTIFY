import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/quantify_db';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully.');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};
