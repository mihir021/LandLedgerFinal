import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
      required: true,
      default: () => `LAND-REG-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    previousOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Flat convenience fields used by the API/frontend (in addition to the
    // nested location/landDetails/pricing/verification blocks below).
    surveyNumber: String,
    district: String,
    state: String,
    city: String,
    address: String,
    landType: String,
    area: Number,
    price: Number,
    description: String,
    latitude: Number,
    longitude: Number,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'Pending', 'Verified', 'Rejected'],
      default: 'pending',
    },
    currentOwnerWallet: String,

    location: {
      state: String,
      district: String,
      city: String,
      taluka: String,
      pincode: String,
      surveyNumber: String,
      subDivisionNumber: String,
      latitude: Number,
      longitude: Number,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },

    landDetails: {
      landType: {
        type: String,
        enum: ['Agricultural Land', 'Residential Plot', 'Commercial Land', 'Industrial Land', 'Agricultural', 'Residential', 'Commercial', 'Industrial', 'Mixed', 'Land'],
      },
      landUseZone: String,
      areaSqft: Number,
      boundaryGeoJson: Object,
    },

    pricing: {
      priceINR: Number,
      pricePerSqft: Number,
      govtCircleRate: Number,
    },

    legalStatus: {
      ownershipType: { type: String, enum: ['Freehold', 'Leasehold'] },
      documentType: { type: String, enum: ['Sale Deed', 'Gift Deed', 'Inheritance', 'Lease Deed'] },
      encumbranceStatus: { type: String, enum: ['Clear', 'Mortgaged', 'Under Litigation'], default: 'Clear' },
      disputeStatus: { type: String, enum: ['None', 'Disputed'], default: 'None' },
      mutationStatus: { type: String, enum: ['Pending', 'Updated'], default: 'Pending' },
      registrationNumber: String,
      registrationDate: Date,
      stampDuty: { paid: Boolean, amount: Number },
    },

    verification: {
      status: { type: String, enum: ['Pending', 'Under Review', 'Verified', 'Rejected'], default: 'Pending' },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verificationDate: Date,
      remarks: String,
    },

    blockchain: {
      contractAddress: String,
      txHash: String,
      // This is the exact parcel id submitted to the smart contract.  It can
      // differ from the human survey number when a suffix is needed to keep it
      // unique on-chain.
      parcelId: String,
      chainNetwork: { type: String, enum: ['Polygon', 'Solana', 'Sepolia', 'Arbitrum Sepolia'], default: 'Arbitrum Sepolia' },
      blockTimestamp: Date,
      ipfsDocumentHash: String,
    },
    blockchainTx: String,
    blockchainPropertyId: String,

    documents: [
      {
        type: { type: String, enum: ['Sale Deed', 'Survey Map', 'Tax Receipt', 'NOC', 'Other'] },
        url: String,
        ipfsHash: String,
        uploadedAt: Date,
      },
    ],

    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // Normalize images: old seeded data stores plain strings, Cloudinary stores {url, public_id}.
        // Mongoose may cast old strings into empty subdocuments {_id: ...} with no url.
        // Always return clean string URLs to prevent frontend t.startsWith crashes.
        if (Array.isArray(ret.images)) {
          ret.images = ret.images
            .map((img) => {
              if (typeof img === 'string') return img;
              if (img && typeof img === 'object' && img.url) return img.url;
              return null;
            })
            .filter(Boolean);
        }
        if (Array.isArray(ret.documents)) {
          ret.documents = ret.documents.map((doc) => {
            if (typeof doc === 'string') return { type: 'Other', url: doc };
            return doc;
          });
        }
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        if (Array.isArray(ret.images)) {
          ret.images = ret.images
            .map((img) => {
              if (typeof img === 'string') return img;
              if (img && typeof img === 'object' && img.url) return img.url;
              return null;
            })
            .filter(Boolean);
        }
        return ret;
      },
    },
  }
);

// Indexes

propertySchema.index({ 'location.state': 1, 'location.city': 1 });
propertySchema.index({ 'verification.status': 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ verificationStatus: 1 });
propertySchema.index({ isListed: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
