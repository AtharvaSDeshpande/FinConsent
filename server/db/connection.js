import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI configured. Running with in-memory persistence store.');
    return false;
  }

  try {
    // Attempt live connection with 5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[DB] Successfully connected to live MongoDB Atlas cluster (AWS Mumbai ap-south-1).');
    return true;
  } catch (err) {
    console.warn(`[DB] Live MongoDB connection unavailable (${err.message}). Seamlessly operating with local in-memory store.`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
