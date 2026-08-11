import Transfer from '../models/Transfer.js';
import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

// =====================================================
// @desc    Request a property transfer (buyer initiates)
// @route   POST /api/transfers/request
// @access  Private (buyer)
// =====================================================
const requestTransfer = async (req, res, next) => {
  try {
    const { propertyId, sellerId } = req.body;
    const buyerId = req.user._id;

    // Ensure property exists and is verified
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

    // Notify the seller
    await Notification.create({
      userId: sellerId,
      title: 'New Transfer Request',
      message: `A buyer has requested to purchase property ${property.propertyId}.`,
      type: 'Transfer Update',
      relatedEntityType: 'Transfer',
      relatedEntityId: transfer._id,
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

    transfer.status = 'Pending Verification';
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
// @desc    Officer approves the transfer
// @route   POST /api/transfers/officer-approve
// @access  Private (officer, admin)
// =====================================================
const officerApprove = async (req, res, next) => {
  try {
    const { transferId, txHash } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.status === 'Initiated') {
      return next(new ApiError(400, 'Seller must approve before the officer'));
    }
    if (transfer.status !== 'Pending Verification') {
      return next(new ApiError(400, 'Officer has already approved or transfer is completed'));
    }

    transfer.status = 'Approved';
    await transfer.save();
    
    if (txHash) {
      await Property.findByIdAndUpdate(transfer.propertyId, {
        blockchainTx: txHash
      });
    }

    // Notify both parties
    const msg = 'Government officer has approved the property transfer.';
    await Notification.insertMany([
      { userId: transfer.fromUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
      { userId: transfer.toUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    ]);

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

    if (transfer.status !== 'Approved') {
      return next(
        new ApiError(400, 'Transfer must be approved by officer before completion')
      );
    }

    // Update property ownership
    const property = await Property.findById(transfer.propertyId._id || transfer.propertyId);
    
    // Add current owner to previousOwners
    property.previousOwners.push(property.ownerId);
    
    // Set new owner
    property.ownerId = transfer.toUserId;
    await property.save();

    transfer.status = 'Completed';
    transfer.completedAt = new Date();
    await transfer.save();

    // Notify both parties
    const msg = 'Property transfer has been completed successfully.';
    await Notification.insertMany([
      { userId: transfer.fromUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
      { userId: transfer.toUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    ]);

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
  officerApprove,
  completeTransfer,
  getTransfers,
};
