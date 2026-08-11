import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      trim: true,
      default: '',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    targetType: {
      type: String,
      trim: true,
      default: '',
    },
    targetId: {
      type: String,
      trim: true,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast audit trail queries
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
