import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    contactPhone: String,
    contactEmail: String,
    status: { type: String, enum: ['Open', 'Responded', 'Closed'], default: 'Open' },
  },
  {
    timestamps: true,
  }
);

// Indexes
inquirySchema.index({ propertyId: 1 });
inquirySchema.index({ userId: 1 });
inquirySchema.index({ status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
