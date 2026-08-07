import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { logger } from './utils/logger.js';

/**
 * Seed script — creates initial users for development.
 * Run with:  npm run seed
 */
const seedUsers = [
  {
    fullName: 'System Admin',
    email: 'admin@landledger.com',
    password: 'Admin@123',
    phone: '9999999991',
    role: 'admin',
    status: 'verified',
  },
  {
    fullName: 'Government Officer',
    email: 'officer@landledger.com',
    password: 'Officer@123',
    phone: '9999999992',
    role: 'officer',
    status: 'verified',
  },
  {
    fullName: 'Demo Seller',
    email: 'seller@landledger.com',
    password: 'Seller@123',
    phone: '9999999993',
    role: 'seller',
    status: 'verified',
  },
  {
    fullName: 'Demo Buyer',
    email: 'buyer@landledger.com',
    password: 'Buyer@123',
    phone: '9999999994',
    role: 'buyer',
    status: 'verified',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    // Remove existing users (optional — safe for dev only)
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Insert seed users (password hashing handled by pre-save hook)
    for (const userData of seedUsers) {
      await User.create(userData);
      logger.info(`Created user: ${userData.email} (${userData.role})`);
    }

    logger.info('Seeding complete ✓');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
