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
    previousOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

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

    landDetails: {
      landType: {
        type: String,
        enum: ['Agricultural Land', 'Residential Plot', 'Commercial Land', 'Industrial Land'],
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
      chainNetwork: { type: String, enum: ['Polygon', 'Solana', 'Sepolia'], default: 'Polygon' },
      blockTimestamp: Date,
      ipfsDocumentHash: String,
    },

    documents: [
      {
        type: { type: String, enum: ['Sale Deed', 'Survey Map', 'Tax Receipt', 'NOC', 'Other'] },
        url: String,
        ipfsHash: String,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
propertySchema.index({ propertyId: 1 }, { unique: true });
propertySchema.index({ 'location.state': 1, 'location.city': 1 });
propertySchema.index({ 'verification.status': 1 });
propertySchema.index({ ownerId: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
