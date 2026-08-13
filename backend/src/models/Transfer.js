import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferType: { type: String, enum: ['Sale', 'Gift', 'Inheritance', 'Lease'] },
    transferAmount: Number,
    status: {
      type: String,
      enum: [
        'pending',
        'pendingRequest',
        'sellerApproved',
        'buyerApproved',
        'officerApproved',
        'completed',
        'Initiated',
        'Pending Verification',
        'Approved',
        'Rejected',
        'failed',
        'Failed',
        'pendingConfirmation',
        'failedConfirmation',
      ],
      default: 'pending',
    },
    sellerApproved: {
      type: Boolean,
      default: false,
    },
    buyerApproved: {
      type: Boolean,
      default: false,
    },
    officerApproved: {
      type: Boolean,
      default: false,
    },

    timeline: [
      {
        stage: {
          type: String,
          trim: true,
        },
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        actorName: {
          type: String,
          trim: true,
        },
        note: {
          type: String,
          trim: true,
          default: '',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ----- Blockchain integration field -----
    transactionHash: {
      type: String,
      default: null,
    },
    documents: [{ type: String, url: String }],
    blockchainTxHash: String,
    buyerWallet: String,
    buyerRequestTxHash: String,
    sellerApprovalTxHash: String,
    buyerApprovalTxHash: String,
    officerApprovalTxHash: String,

    // Crypto payment tracking (optional — only set for crypto-mode purchases)
    paymentMode: { type: String, enum: ['INR', 'Crypto', 'inr', 'crypto'], default: 'INR' },
    transferAmountEth: Number,
    displayPriceEth: Number,
    paymentTxHash: String,

    initiatedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
transferSchema.index({ propertyId: 1 });
transferSchema.index({ fromUserId: 1 });
transferSchema.index({ toUserId: 1 });
transferSchema.index({ status: 1 });
// Analytics aggregation indexes
transferSchema.index({ createdAt: 1 });
transferSchema.index({ completedAt: 1 });
transferSchema.index({ initiatedAt: 1 });

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;
