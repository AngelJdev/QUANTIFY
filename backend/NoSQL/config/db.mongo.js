import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable command buffering so operations fail fast (0ms) instead of hanging 10s if Mongo is offline
mongoose.set('bufferCommands', false);

export const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/quantify_db';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected successfully.');
  } catch (error) {
    console.error('⚠️  MongoDB not available (non-fatal):', error.message);
    console.error('   → Logs and telemetry features will return default values.');
  }
};

