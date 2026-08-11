import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: 'info',
    },
    relatedEntityType: { type: String },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by receiver
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
