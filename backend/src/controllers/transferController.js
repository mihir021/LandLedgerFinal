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
    if (property.status !== 'verified') {
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

    // Notify the seller
    await Notification.create({
      receiver: sellerId,
      title: 'New Transfer Request',
      message: `A buyer has requested to purchase property ${property.propertyId}.`,
      type: 'transfer',
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
    transfer.status = 'seller_approved';
    await transfer.save();

    // Notify buyer
    await Notification.create({
      receiver: transfer.buyer,
      title: 'Seller Approved Transfer',
      message: 'The seller has approved the property transfer.',
      type: 'transfer',
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
// @desc    Officer approves the transfer
// @route   POST /api/transfers/officer-approve
// @access  Private (officer, admin)
// =====================================================
const officerApprove = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (!transfer.sellerApproved) {
      return next(new ApiError(400, 'Seller must approve before the officer'));
    }
    if (transfer.officerApproved) {
      return next(new ApiError(400, 'Officer has already approved'));
    }

    transfer.officerApproved = true;
    transfer.status = 'officer_approved';
    await transfer.save();

    // Notify both parties
    const msg = 'Government officer has approved the property transfer.';
    await Notification.insertMany([
      { receiver: transfer.seller, title: 'Officer Approved', message: msg, type: 'transfer' },
      { receiver: transfer.buyer, title: 'Officer Approved', message: msg, type: 'transfer' },
    ]);

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

    if (!transfer.sellerApproved || !transfer.officerApproved) {
      return next(
        new ApiError(400, 'Both seller and officer must approve before completion')
      );
    }
    if (transfer.status === 'completed') {
      return next(new ApiError(400, 'Transfer is already completed'));
    }

    // Update property ownership
    const property = await Property.findById(transfer.property._id || transfer.property);
    property.owner = transfer.buyer;
    // TODO: Call Stylus Smart Contract Here — execute on-chain ownership transfer
    // After successful on-chain transfer, update:
    //   property.currentOwnerWallet = <buyer wallet>;
    //   transfer.transactionHash = <tx hash>;
    property.status = 'transferred';
    await property.save();

    transfer.buyerApproved = true;
    transfer.status = 'completed';
    await transfer.save();

    // Notify both parties
    const msg = 'Property transfer has been completed successfully.';
    await Notification.insertMany([
      { receiver: transfer.seller, title: 'Transfer Completed', message: msg, type: 'success' },
      { receiver: transfer.buyer, title: 'Transfer Completed', message: msg, type: 'success' },
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
    if (!['admin', 'officer'].includes(req.user.role)) {
      filter = {
        $or: [{ seller: req.user._id }, { buyer: req.user._id }],
      };
    }

    const transfers = await Transfer.find(filter)
      .populate('property', 'propertyId surveyNumber address')
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
  officerApprove,
  completeTransfer,
  getTransfers,
};
