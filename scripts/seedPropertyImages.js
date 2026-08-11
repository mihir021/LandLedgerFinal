import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';
import Property from '../backend/src/models/Property.js';

// Setup environment and DNS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * STRICT REAL-ESTATE & ARCHITECTURE PHOTOGRAPHY ONLY
 * Verified Unsplash photo URLs showing real buildings, houses, warehouses, farmland, and plots.
 * NO abstract finance/concept icons, NO people, NO generic nature/lakes.
 */
const CATEGORY_IMAGES = {
  residential: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6c563aaec9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
  ],

  commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  ],

  industrial: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565891741441-6ad965457790?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
  ],

  agricultural: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535379453347-1ffd615e2e08?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
  ],

  land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
  ],

  mixed: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  ],
};

/**
 * Normalizes property type string into canonical categories
 */
function normalizePropertyType(doc) {
  const rawType = (
    doc.landType ||
    doc.landDetails?.landType ||
    doc.propertyType ||
    ''
  ).toLowerCase();

  if (rawType.includes('agricul') || rawType.includes('farm')) {
    return 'agricultural';
  }
  if (rawType.includes('residen') || rawType.includes('house') || rawType.includes('villa')) {
    return 'residential';
  }
  if (rawType.includes('commerci') || rawType.includes('office') || rawType.includes('retail')) {
    return 'commercial';
  }
  if (rawType.includes('industr') || rawType.includes('factory') || rawType.includes('wareh')) {
    return 'industrial';
  }
  if (rawType.includes('mix')) {
    return 'mixed';
  }
  if (rawType.includes('land') || rawType.includes('plot')) {
    return 'land';
  }

  return 'land';
}

/**
 * Deterministic 32-bit hash (FNV-1a algorithm)
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Selects 3-4 deterministic unique images from category array based on property ID
 */
function selectImagesForProperty(doc) {
  const categoryKey = normalizePropertyType(doc);
  const pool = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.land;
  const poolSize = pool.length;

  const seedStr = doc.propertyId || String(doc._id);
  const hash = hashString(seedStr);

  const count = (hash % 2 === 0) ? 3 : 4;
  const selected = [];
  const usedIndices = new Set();

  for (let i = 0; i < count; i++) {
    const stepHash = hashString(`${seedStr}-img-${i}`);
    let index = stepHash % poolSize;

    while (usedIndices.has(index)) {
      index = (index + 1) % poolSize;
    }

    usedIndices.add(index);
    selected.push(pool[index]);
  }

  return selected;
}

/**
 * Main Backfill Script (with Overwrite Mode support)
 */
async function backfillPropertyImages() {
  const overwriteAll = true;

  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB;
  if (!dbUri) {
    console.error('❌ Error: MONGODB_URI not found in environment.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(dbUri);
  console.log('✅ Connected to MongoDB.');

  const filter = {};

  const totalMatching = await Property.countDocuments(filter);
  console.log(`📦 Found ${totalMatching} property records to re-seed (Overwrite mode: ${overwriteAll}).`);

  if (totalMatching === 0) {
    console.log('🎉 No properties matched filter.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const cursor = Property.find(filter).cursor();

  let totalUpdated = 0;
  let errorCount = 0;
  let bulkOps = [];
  const BATCH_SIZE = 200;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const selectedImages = selectImagesForProperty(doc);

      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { images: selectedImages } },
        },
      });

      if (bulkOps.length >= BATCH_SIZE) {
        const res = await Property.bulkWrite(bulkOps);
        totalUpdated += res.modifiedCount || bulkOps.length;
        bulkOps = [];
        console.log(`⏳ Processed ${totalUpdated} / ${totalMatching} records...`);
      }
    } catch (err) {
      errorCount++;
      console.error(`⚠️ Error processing property ${doc._id}:`, err.message);
    }
  }

  if (bulkOps.length > 0) {
    try {
      const res = await Property.bulkWrite(bulkOps);
      totalUpdated += res.modifiedCount || bulkOps.length;
    } catch (err) {
      errorCount++;
      console.error('⚠️ Error executing final bulkWrite batch:', err.message);
    }
  }

  console.log('\n========================================');
  console.log('🎉 PROPERTY REAL-ESTATE IMAGE RE-SEEDING COMPLETED!');
  console.log(`  Total Processed & Overwritten: ${totalUpdated}`);
  console.log(`  Errors Encountered:           ${errorCount}`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

backfillPropertyImages().catch((err) => {
  console.error('❌ Unhandled script error:', err);
  process.exit(1);
});
