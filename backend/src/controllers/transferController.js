import Transfer from '../models/Transfer.js';
import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';

// Helper to append a timeline entry
const pushTimeline = (transfer, stage, actor, note = '') => {
  transfer.timeline.push({
    stage,
    actor: actor?._id,
    actorName: actor?.fullName || '',
    note,
    timestamp: new Date(),
  });
};

// =====================================================
// @desc    Request a property transfer (buyer initiates)
// @route   POST /api/transfers/request
// @access  Private (buyer)
// =====================================================
const requestTransfer = async (req, res, next) => {
  try {
    const { propertyId, sellerId } = req.body;
    const buyerId = req.user._id;

    // Ensure property exists and is verified + listed
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }
    if (property.verificationStatus !== 'verified') {
      return next(new ApiError(400, 'Property must be verified before transfer'));
    }
    if (property.owner.toString() !== sellerId) {
      return next(new ApiError(400, 'Seller does not own this property'));
    }

    // Prevent duplicate pending transfers
    const existingTransfer = await Transfer.findOne({
      property: propertyId,
      buyer: buyerId,
      status: { $nin: ['completed'] },
    });
    if (existingTransfer) {
      return next(new ApiError(409, 'A transfer request already exists for this property'));
    }

    const transfer = await Transfer.create({
      property: propertyId,
      seller: sellerId,
      buyer: buyerId,
    });

    pushTimeline(transfer, 'Transfer Requested', req.user, 'Buyer initiated the transfer request');
    await transfer.save();

    // Mark the property as in-transfer so it stops being publicly purchasable
    property.isListed = false;
    await property.save();

    // Notify the seller
    await Notification.create({
      receiver: sellerId,
      title: 'New Transfer Request',
      message: `A buyer has requested to purchase property ${property.propertyId}.`,
      type: 'transfer',
    });

    await logAudit({
      req,
      action: 'transfer.request',
      targetType: 'Transfer',
      targetId: transfer._id,
      details: { propertyId, sellerId },
    });

    res.status(201).json({
      success: true,
      message: 'Transfer request created',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Seller approves the transfer
// @route   POST /api/transfers/seller-approve
// @access  Private (seller)
// =====================================================
const sellerApprove = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.seller.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only the property seller can approve'));
    }
    if (transfer.sellerApproved) {
      return next(new ApiError(400, 'Seller has already approved'));
    }

    transfer.sellerApproved = true;
    transfer.status = 'sellerApproved';
    pushTimeline(transfer, 'Seller Approved', req.user, 'Seller agreed to the transfer');
    await transfer.save();

    // Notify buyer
    await Notification.create({
      receiver: transfer.buyer,
      title: 'Seller Approved Transfer',
      message: 'The seller has approved the property transfer.',
      type: 'transfer',
    });

    await logAudit({
      req,
      action: 'transfer.seller_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });

    // TODO: Call Stylus Smart Contract Here — record seller approval on-chain

    res.status(200).json({
      success: true,
      message: 'Seller approval recorded',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Buyer approves / signs the transfer
// @route   POST /api/transfers/buyer-approve
// @access  Private (buyer)
// =====================================================
const buyerApprove = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.buyer.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only the property buyer can approve'));
    }
    if (!transfer.sellerApproved) {
      return next(new ApiError(400, 'Seller must approve before the buyer can sign'));
    }
    if (transfer.buyerApproved) {
      return next(new ApiError(400, 'Buyer has already approved'));
    }

    transfer.buyerApproved = true;
    transfer.status = 'buyerApproved';
    pushTimeline(transfer, 'Buyer Signed', req.user, 'Buyer signed and approved the transfer');
    await transfer.save();

    // Notify seller
    await Notification.create({
      receiver: transfer.seller,
      title: 'Buyer Approved Transfer',
      message: 'The buyer has signed and approved the property transfer.',
      type: 'transfer',
    });

    await logAudit({
      req,
      action: 'transfer.buyer_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });

    res.status(200).json({
      success: true,
      message: 'Buyer approval recorded',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Officer approves the transfer
// @route   POST /api/transfers/officer-approve
// @access  Private (officer, admin)
// =====================================================
const officerApprove = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (!transfer.sellerApproved || !transfer.buyerApproved) {
      return next(
        new ApiError(400, 'Both seller and buyer must approve before the officer')
      );
    }
    if (transfer.officerApproved) {
      return next(new ApiError(400, 'Officer has already approved'));
    }

    transfer.officerApproved = true;
    transfer.status = 'officerApproved';
    pushTimeline(transfer, 'Officer Approved', req.user, 'Government officer approved the transfer');
    await transfer.save();

    // Notify both parties
    const msg = 'Government officer has approved the property transfer.';
    await Notification.insertMany([
      { receiver: transfer.seller, title: 'Officer Approved', message: msg, type: 'transfer' },
      { receiver: transfer.buyer, title: 'Officer Approved', message: msg, type: 'transfer' },
    ]);

    await logAudit({
      req,
      action: 'transfer.officer_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });

    // TODO: Call Stylus Smart Contract Here — record officer approval on-chain

    res.status(200).json({
      success: true,
      message: 'Officer approval recorded',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Complete the transfer
// @route   POST /api/transfers/complete
// @access  Private (officer, admin)
// =====================================================
const completeTransfer = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    const transfer = await Transfer.findById(transferId).populate('property');
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (!transfer.sellerApproved || !transfer.buyerApproved || !transfer.officerApproved) {
      return next(
        new ApiError(
          400,
          'Seller, buyer and officer must all approve before completion'
        )
      );
    }
    if (transfer.status === 'completed') {
      return next(new ApiError(400, 'Transfer is already completed'));
    }

    // Update property ownership
    const property = await Property.findById(transfer.property._id || transfer.property);
    property.owner = transfer.buyer;
    property.currentOwnerWallet = req.user.walletAddress || null;
    property.isListed = false;
    // TODO: Call Stylus Smart Contract Here — execute on-chain ownership transfer
    // After successful on-chain transfer, update:
    //   property.currentOwnerWallet = <buyer wallet>;
    //   transfer.transactionHash = <tx hash>;
    await property.save();

    transfer.buyerApproved = true;
    transfer.status = 'completed';
    pushTimeline(transfer, 'Transfer Completed', req.user, 'Ownership officially transferred');
    await transfer.save();

    // Notify both parties
    const msg = 'Property transfer has been completed successfully.';
    await Notification.insertMany([
      { receiver: transfer.seller, title: 'Transfer Completed', message: msg, type: 'success' },
      { receiver: transfer.buyer, title: 'Transfer Completed', message: msg, type: 'success' },
    ]);

    await logAudit({
      req,
      action: 'transfer.complete',
      targetType: 'Transfer',
      targetId: transfer._id,
      details: { propertyId: property.propertyId, newOwner: transfer.buyer },
    });

    res.status(200).json({
      success: true,
      message: 'Transfer completed — ownership updated',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get all transfers (admin/officer: all, others: own)
// @route   GET /api/transfers
// @access  Private
// =====================================================
const getTransfers = async (req, res, next) => {
  try {
    let filter = {};

    // Non-admin/officer users only see their own transfers
    if (!['admin', 'officer'].includes(req.user.role)) {
      filter = {
        $or: [{ seller: req.user._id }, { buyer: req.user._id }],
      };
    }

    const transfers = await Transfer.find(filter)
      .populate('property', 'propertyId surveyNumber address city district state')
      .populate('seller', 'fullName email')
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Transfers retrieved',
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

export {
  requestTransfer,
  sellerApprove,
  buyerApprove,
  officerApprove,
  completeTransfer,
  getTransfers,
};
