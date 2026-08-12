import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB using the URI from environment variables.
 * Throws on failure so the caller can fail loudly instead of limping along.
 */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
    if (!dbUri) {
      throw new Error('Database URI (MONGODB_URI, MONGO_URI, or DB) is not defined in environment variables.');
    }
    const conn = await mongoose.connect(dbUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Fail loudly instead of limping along: rethrowing lets the caller
    // (serverless handler / server startup) reject and surface the failure
    // instead of serving routes against an uninitialized connection.
    throw error;
  }
};

export default connectDB;
