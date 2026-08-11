import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    raiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raiser is required'],
    },
    subject: {
      type: String,
      required: [true, 'Dispute subject is required'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'rejected', 'closed'],
      default: 'open',
    },
    resolution: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
disputeSchema.index({ property: 1 });
disputeSchema.index({ raiser: 1 });
disputeSchema.index({ status: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;
