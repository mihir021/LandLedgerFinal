import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
    status: { type: String, enum: ['Pending', 'Open', 'Responded', 'Closed'], default: 'Pending' },
  },
  {
    timestamps: true,
  }
);

// Indexes
inquirySchema.index({ property: 1 });
inquirySchema.index({ user: 1 });
inquirySchema.index({ status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
