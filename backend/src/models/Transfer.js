import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'sellerApproved',
        'buyerApproved',
        'officerApproved',
        'completed',
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
    // TODO: Populate when transfer is recorded on-chain via Stylus Smart Contract
    transactionHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transferSchema.index({ property: 1 });
transferSchema.index({ seller: 1 });
transferSchema.index({ buyer: 1 });
transferSchema.index({ status: 1 });

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;
