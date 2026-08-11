# LandLedger — Full Database Structure + Migration Plan

Your DB has 5 collections already: `properties`, `users`, `transfers`, `inquiries`, `notifications`.
Below is the proper schema for each, how your CSV maps into `properties`, and a ready-to-paste prompt for your coding agent (Cursor/Claude Code).

Stack assumption: **Node.js + Express + Mongoose + MongoDB Atlas** (matching your Dinexa/FormBuddy stack). If BhoomiChain backend is different, tell the agent to adjust — the schema logic stays the same.

---

## 1. `users` collection

```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  phone: String,
  role: { type: String, enum: ["buyer", "seller", "registrar", "admin"], default: "buyer" },
  govtId: {
    type: { type: String, enum: ["Aadhaar", "PAN", "Passport"] },
    numberHash: String        // never store raw govt ID, only hashed
  },
  walletAddress: { type: String, unique: true, sparse: true }, // for blockchain tx signing
  kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

## 2. `properties` collection (main — this is where your CSV lands)

```js
{
  _id: ObjectId,
  propertyId: { type: String, unique: true, required: true },  // LAND-REG-42548

  ownerId: { type: ObjectId, ref: "User" },
  previousOwners: [{ type: ObjectId, ref: "User" }],           // chain of custody

  location: {
    state: String,
    district: String,          // NOT in CSV — needs adding
    city: String,
    taluka: String,            // NOT in CSV
    pincode: String,           // NOT in CSV
    surveyNumber: String,      // NOT in CSV — critical, legal parcel ID
    subDivisionNumber: String,
    latitude: Number,          // NOT in CSV
    longitude: Number,         // NOT in CSV
  },

  landDetails: {
    landType: { type: String, enum: ["Agricultural Land", "Residential Plot", "Commercial Land", "Industrial Land"] },
    landUseZone: String,       // Residential/Agri/Commercial/Mixed — zoning ≠ land type
    areaSqft: Number,
    boundaryGeoJson: Object,   // optional, for map plotting
  },

  pricing: {
    priceINR: Number,
    pricePerSqft: Number,
    govtCircleRate: Number,    // NOT in CSV — govt valuation vs transaction price
  },

  legalStatus: {
    ownershipType: { type: String, enum: ["Freehold", "Leasehold"] },
    documentType: { type: String, enum: ["Sale Deed", "Gift Deed", "Inheritance", "Lease Deed"] },
    encumbranceStatus: { type: String, enum: ["Clear", "Mortgaged", "Under Litigation"], default: "Clear" },
    disputeStatus: { type: String, enum: ["None", "Disputed"], default: "None" },
    mutationStatus: { type: String, enum: ["Pending", "Updated"], default: "Pending" },
    registrationNumber: String,
    registrationDate: Date,
    stampDuty: { paid: Boolean, amount: Number },
  },

  verification: {
    status: { type: String, enum: ["Pending", "Under Review", "Verified", "Rejected"], default: "Pending" },
    verifiedBy: { type: ObjectId, ref: "User" },   // registrar who verified
    verificationDate: Date,
    remarks: String,
  },

  blockchain: {
    contractAddress: String,
    txHash: String,
    chainNetwork: { type: String, enum: ["Polygon", "Solana", "Sepolia"], default: "Polygon" },
    blockTimestamp: Date,
    ipfsDocumentHash: String,   // actual deed scan, stored off-chain
  },

  documents: [{
    type: { type: String, enum: ["Sale Deed", "Survey Map", "Tax Receipt", "NOC", "Other"] },
    url: String,
    ipfsHash: String,
    uploadedAt: Date,
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}
```

**Indexes:**
```js
db.properties.createIndex({ propertyId: 1 }, { unique: true })
db.properties.createIndex({ "location.state": 1, "location.city": 1 })
db.properties.createIndex({ "verification.status": 1 })
db.properties.createIndex({ ownerId: 1 })
```

## 3. `transfers` collection

```js
{
  _id: ObjectId,
  propertyId: { type: ObjectId, ref: "Property" },
  fromUserId: { type: ObjectId, ref: "User" },
  toUserId: { type: ObjectId, ref: "User" },
  transferType: { type: String, enum: ["Sale", "Gift", "Inheritance", "Lease"] },
  transferAmount: Number,
  status: { type: String, enum: ["Initiated", "Pending Verification", "Approved", "Rejected", "Completed"], default: "Initiated" },
  documents: [{ type: String, url: String }],
  blockchainTxHash: String,
  initiatedAt: { type: Date, default: Date.now },
  completedAt: Date,
}
```

## 4. `inquiries` collection

```js
{
  _id: ObjectId,
  propertyId: { type: ObjectId, ref: "Property" },
  userId: { type: ObjectId, ref: "User" },       // who's inquiring
  message: String,
  contactPhone: String,
  contactEmail: String,
  status: { type: String, enum: ["Open", "Responded", "Closed"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
}
```

## 5. `notifications` collection

```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: "User" },       // recipient
  type: { type: String, enum: ["Transfer Update", "Verification Update", "Inquiry", "System"] },
  title: String,
  message: String,
  relatedEntityType: { type: String, enum: ["Property", "Transfer", "Inquiry"] },
  relatedEntityId: ObjectId,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}
```

---

## CSV → `properties` field mapping

| CSV Column | Maps to |
|---|---|
| Property_ID | propertyId |
| State | location.state |
| City | location.city |
| Land_Type | landDetails.landType |
| Area_sqft | landDetails.areaSqft |
| Price_INR | pricing.priceINR |
| Price_Per_Sqft | pricing.pricePerSqft |
| Verification_Status | verification.status |
| Blockchain_Tx_Hash | blockchain.txHash (empty for 320/1000 rows — those are "Pending"/unverified, expected) |

**Missing from CSV, needs synthetic/default values on import:** `district`, `surveyNumber`, `pincode`, `latitude/longitude`, `ownershipType`, `encumbranceStatus`, `registrationNumber`. Your agent should either generate plausible dummy values (for a demo dataset) or leave them `null` and flag them for manual entry — tell it which you want.

---

## Prompt for your coding agent (Cursor / Claude Code)

```
I'm building LandLedger, a MongoDB-based land registry backend (Node.js + Express + Mongoose).
My database currently has 5 collections: properties, users, transfers, inquiries, notifications,
but the schemas are too shallow. I need you to:

1. Create/update Mongoose models in /models for all 5 collections using this exact structure:
   [paste the 5 schema blocks above]

2. Add the indexes listed above to the Property model.

3. Write a one-time migration script (/scripts/importProperties.js) that:
   - Reads real_property_data.csv (columns: Property_ID, State, City, Land_Type, Area_sqft,
     Price_INR, Price_Per_Sqft, Verification_Status, Blockchain_Tx_Hash)
   - Maps each row into the new Property schema per this mapping:
     Property_ID -> propertyId, State -> location.state, City -> location.city,
     Land_Type -> landDetails.landType, Area_sqft -> landDetails.areaSqft,
     Price_INR -> pricing.priceINR, Price_Per_Sqft -> pricing.pricePerSqft,
     Verification_Status -> verification.status, Blockchain_Tx_Hash -> blockchain.txHash
   - For fields NOT present in the CSV (district, surveyNumber, pincode, latitude,
     longitude, ownershipType, encumbranceStatus, registrationNumber): set them to null
     for now, do not fabricate legal data.
   - Uses batched inserts (insertMany in chunks of 100) since there are 1000 rows.
   - Logs a summary at the end: total rows processed, inserted, skipped/failed with reasons.
   - Connects to MongoDB using the same connection-pooling pattern already used in the
     Dinexa backend (reuse cached connection, don't reconnect per request).

4. Update any existing API routes/controllers that read from the old flat Property shape
   (e.g. property.State, property.Price_INR) to use the new nested shape
   (property.location.state, property.pricing.priceINR).

5. Add Mongoose-level validation: required fields (propertyId, ownerId ref once assigned,
   landDetails.landType, pricing.priceINR), enum constraints exactly as specified above.

6. Do NOT change the users, transfers, inquiries, or notifications collections' existing
   data — only add/update their schema definitions to match what's above if they don't
   already match.

7. After migration, run a quick validation query and report: how many properties have
   verification.status = "Verified" vs "Pending" vs "Under Review" vs "Rejected", and
   how many have a non-null blockchain.txHash.

Show me the model files and migration script before running the migration.
```

---

A few things worth deciding before you hand this to the agent:

- **Synthetic legal data or nulls?** The CSV has no survey numbers, district, or coordinates. For a hackathon/demo you might want the agent to fabricate plausible values; for anything closer to production, leave them null and build an admin form to fill them in.
- **Who assigns `ownerId`?** Right now the CSV has no owner info at all — properties will import with `ownerId: null` until you either generate dummy users or build an assignment flow.
