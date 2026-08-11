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
      enum: ['Initiated', 'Pending Verification', 'Approved', 'Rejected', 'Completed'],
      default: 'Initiated',
    },
    documents: [{ type: String, url: String }],
    blockchainTxHash: String,
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

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;
