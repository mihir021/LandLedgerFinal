/**
 * Migration: Fix walletAddress null duplicates
 *
 * This script:
 * 1. Unsets `walletAddress` on every user document where it is null
 *    (so MongoDB no longer sees them as having the same "null" key).
 * 2. Drops the old walletAddress index and lets Mongoose recreate
 *    the correct sparse unique index on next server start.
 *
 * Run once:  node --experimental-modules src/fixWalletIndex.js
 */

import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

const run = async () => {
  const dbUri =
    process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
  if (!dbUri) {
    console.error('No MONGODB_URI, MONGO_URI or DB specified in environment.');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('✅  Connected to MongoDB');

  const usersCol = mongoose.connection.db.collection('users');

  // Step 1 — Remove the walletAddress field from any document where it is null
  const result = await usersCol.updateMany(
    { walletAddress: null },
    { $unset: { walletAddress: '' } }
  );
  console.log(
    `✅  Cleared null walletAddress from ${result.modifiedCount} user(s)`
  );

  // Step 2 — Drop the old index so Mongoose can recreate it cleanly
  try {
    await usersCol.dropIndex('walletAddress_1');
    console.log('✅  Dropped old walletAddress_1 index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('ℹ️   walletAddress_1 index did not exist — nothing to drop');
    } else {
      throw err;
    }
  }

  // Step 3 — Recreate the correct sparse unique index
  await usersCol.createIndex(
    { walletAddress: 1 },
    { unique: true, sparse: true }
  );
  console.log('✅  Recreated sparse unique index on walletAddress');

  await mongoose.disconnect();
  console.log('🎉  Migration complete — you can now register new users!');
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
