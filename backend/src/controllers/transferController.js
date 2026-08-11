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
    if (property.verification.status !== 'Verified') {
      return next(new ApiError(400, 'Property must be verified before transfer'));
    }
    if (property.ownerId.toString() !== sellerId) {
      return next(new ApiError(400, 'Seller does not own this property'));
    }

    // Prevent duplicate pending transfers
    const existingTransfer = await Transfer.findOne({
      propertyId: propertyId,
      toUserId: buyerId,
      status: { $nin: ['Completed', 'Rejected'] },
    });
    if (existingTransfer) {
      return next(new ApiError(409, 'A transfer request already exists for this property'));
    }

    const transfer = await Transfer.create({
      propertyId: propertyId,
      fromUserId: sellerId,
      toUserId: buyerId,
      transferType: 'Sale',
      status: 'Initiated',
    });

    pushTimeline(transfer, 'Transfer Requested', req.user, 'Buyer initiated the transfer request');
    await transfer.save();

    // Mark the property as in-transfer so it stops being publicly purchasable
    property.isListed = false;
    await property.save();

    // Notify the seller
    await Notification.create({
      userId: sellerId,
      title: 'New Transfer Request',
      message: `A buyer has requested to purchase property ${property.propertyId}.`,
      type: 'Transfer Update',
      relatedEntityType: 'Transfer',
      relatedEntityId: transfer._id,
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

    if (transfer.fromUserId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only the property seller can approve'));
    }
    if (transfer.status !== 'Initiated') {
      return next(new ApiError(400, 'Seller has already approved or transfer is past this stage'));
    }

    transfer.sellerApproved = true;
    transfer.status = 'Pending Verification';
    pushTimeline(transfer, 'Seller Approved', req.user, 'Seller agreed to the transfer');
    await transfer.save();

    // Notify buyer
    await Notification.create({
      userId: transfer.toUserId,
      title: 'Seller Approved Transfer',
      message: 'The seller has approved the property transfer.',
      type: 'Transfer Update',
      relatedEntityType: 'Transfer',
      relatedEntityId: transfer._id,
    });

    await logAudit({
      req,
      action: 'transfer.seller_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });
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
    const { transferId, txHash } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (!transfer.sellerApproved && transfer.status === 'Initiated') {
      return next(new ApiError(400, 'Seller must approve before the officer'));
    }

    transfer.officerApproved = true;
    transfer.status = 'Approved';
    pushTimeline(transfer, 'Officer Approved', req.user, 'Government officer approved the transfer');
    await transfer.save();
    
    if (txHash) {
      const pId = transfer.propertyId || transfer.property;
      if (pId) {
        await Property.findByIdAndUpdate(pId, {
          blockchainTx: txHash
        });
      }
    }

    // Notify both parties
    const msg = 'Government officer has approved the property transfer.';
    await Notification.insertMany([
      { userId: transfer.fromUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
      { userId: transfer.toUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    ]);

    await logAudit({
      req,
      action: 'transfer.officer_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });

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

    const transfer = await Transfer.findById(transferId).populate('propertyId');
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.status !== 'Approved' && !transfer.officerApproved) {
      return next(
        new ApiError(400, 'Transfer must be approved by officer before completion')
      );
    }

    // Update property ownership
    const targetPropertyId = transfer.propertyId?._id || transfer.propertyId || transfer.property?._id || transfer.property;
    const property = await Property.findById(targetPropertyId);
    
    if (property) {
      if (property.ownerId || property.owner) {
        property.previousOwners = property.previousOwners || [];
        property.previousOwners.push(property.ownerId || property.owner);
      }
      property.ownerId = transfer.toUserId || transfer.buyer;
      property.owner = transfer.toUserId || transfer.buyer;
      property.currentOwnerWallet = req.user.walletAddress || null;
      property.isListed = false;
      await property.save();
    }

    transfer.status = 'Completed';
    transfer.completedAt = new Date();
    pushTimeline(transfer, 'Transfer Completed', req.user, 'Ownership officially transferred');
    await transfer.save();

    // Notify both parties
    const msg = 'Property transfer has been completed successfully.';
    await Notification.insertMany([
      { userId: transfer.fromUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
      { userId: transfer.toUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    ]);

    await logAudit({
      req,
      action: 'transfer.complete',
      targetType: 'Transfer',
      targetId: transfer._id,
      details: { propertyId: property?.propertyId, newOwner: transfer.toUserId || transfer.buyer },
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
    if (!['admin', 'officer', 'registrar'].includes(req.user.role)) {
      filter = {
        $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
      };
    }

    const transfers = await Transfer.find(filter)
      .populate('propertyId', 'propertyId location')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });
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
