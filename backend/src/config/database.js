import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB using the URI from environment variables.
 * Gracefully exits if the connection fails.
 */
const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
    if (!dbUri) {
      throw new Error('Database URI (MONGODB_URI, MONGO_URI, or DB) is not defined in environment variables.');
    }
    const conn = await mongoose.connect(dbUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
