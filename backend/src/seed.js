import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import User from './models/User.js';
import Property from './models/Property.js';
import Inquiry from './models/Inquiry.js';
import Notification from './models/Notification.js';
import { logger } from './utils/logger.js';

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
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
    if (!dbUri) {
      throw new Error('No MONGODB_URI, MONGO_URI or DB specified in environment.');
    }

    await mongoose.connect(dbUri);
    logger.info('Connected to MongoDB Atlas for seeding');

    // Clear existing test data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Inquiry.deleteMany({});
    await Notification.deleteMany({});
    logger.info('Cleared existing collections');

    // Insert users
    const createdUsers = {};
    for (const userData of seedUsers) {
      const u = await User.create(userData);
      createdUsers[u.role] = u;
      logger.info(`Created user: ${u.email} (${u.role})`);
    }

    // Insert sample properties
    const propertiesData = [
      {
        surveyNumber: 'SRV-1024-A',
        owner: createdUsers.seller._id,
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        city: 'Bengaluru',
        address: 'Sector 4, HSR Layout',
        landType: 'residential',
        area: 2400,
        price: 8500000,
        description: 'Prime residential plot located in high-growth HSR Layout area.',
        verificationStatus: 'verified',
        blockchainTx: '0x8f3c41a2b910e5d93e110c71a39f1e82b7f941c',
        blockchainPropertyId: 'LAND-REG-8812',
      },
      {
        surveyNumber: 'SRV-8840-B',
        owner: createdUsers.seller._id,
        district: 'Pune',
        state: 'Maharashtra',
        city: 'Pune',
        address: 'Hinjawadi Phase 3',
        landType: 'commercial',
        area: 5000,
        price: 16500000,
        description: 'Commercial plot ideal for tech office or retail space near IT park.',
        verificationStatus: 'verified',
        blockchainTx: '0x4e29b1837c72f1092a40b991823a771b9942a',
        blockchainPropertyId: 'LAND-REG-9014',
      },
      {
        surveyNumber: 'SRV-3312-C',
        owner: createdUsers.seller._id,
        district: 'Gandhinagar',
        state: 'Gujarat',
        city: 'Gandhinagar',
        address: 'GIFT City Zone 2',
        landType: 'agricultural',
        area: 12000,
        price: 12000000,
        description: 'Fertile agricultural parcel with direct canal water access.',
        verificationStatus: 'pending',
      },
    ];

    const createdProps = [];
    for (const pData of propertiesData) {
      const prop = await Property.create(pData);
      createdProps.push(prop);
      logger.info(`Created property: ${prop.propertyId} (${prop.city})`);
    }

    // Insert sample inquiries into the new Inquiry collection
    const sampleInquiries = [
      {
        property: createdProps[0]._id,
        user: createdUsers.buyer._id,
        name: createdUsers.buyer.fullName,
        email: createdUsers.buyer.email,
        phone: createdUsers.buyer.phone,
        subject: 'Title Deed Verification Request',
        message: 'Hello, I am interested in purchasing this HSR Layout plot. Could you confirm if the survey records match municipal revenue logs?',
        status: 'pending',
      },
      {
        property: createdProps[1]._id,
        user: createdUsers.buyer._id,
        name: createdUsers.buyer.fullName,
        email: createdUsers.buyer.email,
        phone: createdUsers.buyer.phone,
        subject: 'Commercial Zoning Inquiry',
        message: 'Is the Hinjawadi land approved for multi-story office building construction?',
        status: 'in-progress',
        response: 'Under review by local urban development officer.',
      },
      {
        name: 'Anita Sharma',
        email: 'anita.sharma@example.com',
        phone: '9876543210',
        subject: 'General Registration Process',
        message: 'What documents are required for registering an agricultural land transfer on LandLedger?',
        status: 'resolved',
        response: 'You need Aadhaar, title deed copy, survey boundary map, and seller NOC.',
      },
    ];

    for (const inqData of sampleInquiries) {
      const inq = await Inquiry.create(inqData);
      logger.info(`Created inquiry: ${inq.subject} [Status: ${inq.status}]`);
    }

    logger.info('Database Seeding Complete! All collections populated in MongoDB Atlas ✓');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
