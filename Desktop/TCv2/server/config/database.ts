// MongoDB connection. Singleton — every request reuses the same promise.

import mongoose from 'mongoose';
import { env } from './env.js';

const mongoOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // force IPv4 to avoid DNS issues on some hosts
  retryWrites: true,
  retryReads: true,
};

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    console.log('🔌 Connecting to MongoDB…');
    connectionPromise = mongoose
      .connect(env.MONGO_URI, mongoOptions)
      .then(async (m) => {
        console.log('✅ MongoDB connected');
        // Warm up the connection so the first real query is fast
        try {
          await m.connection.db.admin().ping();
        } catch {
          /* non-fatal */
        }
        return m;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error('❌ MongoDB connection failed:', err);
        throw err;
      });
  }
  return connectionPromise;
};

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
  connectionPromise = null;
});
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});
