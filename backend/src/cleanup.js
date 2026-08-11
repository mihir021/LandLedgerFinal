import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import { logger } from './utils/logger.js';

const collectionsToRemove = [
  'menuitems',
  'orders',
  'pendingusers',
  'reservations',
  'restaurants',
  'seatlocks'
];

const cleanup = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
    if (!dbUri) {
      throw new Error('No MONGODB_URI specified in environment.');
    }

    await mongoose.connect(dbUri);
    logger.info('Connected to MongoDB for cleanup');

    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    for (const collectionName of collectionsToRemove) {
      if (existingNames.includes(collectionName)) {
        await db.dropCollection(collectionName);
        logger.info(`Dropped collection: ${collectionName}`);
      } else {
        logger.info(`Collection ${collectionName} does not exist, skipping.`);
      }
    }

    logger.info('Database cleanup complete ✓');
    process.exit(0);
  } catch (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    process.exit(1);
  }
};

cleanup();
