import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['Transfer Update', 'Verification Update', 'Inquiry', 'System'] },
    title: String,
    message: String,
    relatedEntityType: { type: String, enum: ['Property', 'Transfer', 'Inquiry'] },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by receiver
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
