import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
      default: () => `PROP-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    landType: {
      type: String,
      enum: ['agricultural', 'residential', 'commercial', 'industrial', 'mixed'],
      required: [true, 'Land type is required'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0, 'Area must be positive'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    description: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    images: [
      {
        type: String, // file paths
      },
    ],
    documents: [
      {
        type: String, // file paths
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },

    // ----- Blockchain integration fields -----
    // TODO: Populate these fields when Stylus Smart Contract is integrated
    blockchainTx: {
      type: String,
      default: null,
    },
    blockchainPropertyId: {
      type: String,
      default: null,
    },
    currentOwnerWallet: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common query patterns
propertySchema.index({ owner: 1 });
propertySchema.index({ verificationStatus: 1 });
propertySchema.index({ state: 1, district: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
