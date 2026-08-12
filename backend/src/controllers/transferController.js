import Transfer from '../models/Transfer.js';
import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';
import { getTransactionReceipt, syncTransferStatus } from '../services/blockchainService.js';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc')
});

// Helper to append a timeline entry
const pushTimeline = (transfer, stage, actor, note = '') => {
  transfer.timeline.push({
    stage,
    actor: actor?._id,
    actorName: actor?.fullName || actor?.name || '',
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
    const { propertyId, sellerId, txHash, buyerWallet, paymentMode, transferAmountEth, displayPriceEth, paymentTxHash } = req.body;
    const buyerId = req.user._id;

    // Ensure property exists and is verified + listed
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }
    const isVerified = (property.verification?.status || property.verificationStatus)?.toLowerCase() === 'verified';
    if (!isVerified) {
      return next(new ApiError(400, 'Property must be verified before transfer'));
    }
    const propertyOwnerId = property.ownerId || property.owner;
    if (!propertyOwnerId || propertyOwnerId.toString() !== sellerId) {
      return next(new ApiError(400, 'Seller does not own this property'));
    }

    // Prevent duplicate pending transfers
    const existingTransfer = await Transfer.findOne({
      propertyId: propertyId,
      toUserId: buyerId,
      status: { $nin: ['Completed', 'completed', 'Rejected', 'failed', 'Failed', 'failedConfirmation'] },
    });
    if (existingTransfer) {
      return next(new ApiError(409, 'A transfer request already exists for this property'));
    }

    // Initialize transfer in pendingRequest status — DO NOT instantly delist the property
    const transfer = await Transfer.create({
      propertyId: propertyId,
      fromUserId: sellerId,
      toUserId: buyerId,
      transferType: 'Sale',
      status: 'pendingRequest',
      buyerWallet,
      buyerRequestTxHash: txHash,
      blockchainTxHash: txHash,
      // Crypto payment tracking (only set when buyer uses Crypto mode)
      ...(paymentMode && { paymentMode }),
      ...(transferAmountEth != null && { transferAmountEth }),
      ...(displayPriceEth != null && { displayPriceEth }),
      ...(paymentTxHash && { paymentTxHash }),
    });

    pushTimeline(transfer, 'Transfer Requested', req.user, 'Buyer initiated the transfer request');

    // If txHash was supplied, check receipt on-chain
    if (txHash) {
      const check = await getTransactionReceipt(txHash);

      if (check.status === 'success') {
        transfer.status = 'Initiated';
        pushTimeline(transfer, 'On-Chain Confirmed', null, 'Purchase request confirmed on blockchain');

        // Confirmed on-chain: safely delist property so other buyers cannot purchase
        property.isListed = false;
        await property.save();

        // Notify seller
        await Notification.create({
          receiver: sellerId,
          userId: sellerId,
          title: 'New Transfer Request',
          message: `A buyer has requested to purchase property ${property.propertyId}.`,
          type: 'Transfer Update',
          relatedEntityType: 'Transfer',
          relatedEntityId: transfer._id,
        });
      } else if (check.status === 'reverted') {
        transfer.status = 'Rejected';
        pushTimeline(transfer, 'Transaction Failed', null, 'On-chain transaction reverted or failed');
        // Leave property listed for other buyers
      }
      // If status is 'pending', keep transfer as 'pendingRequest' and property stays listed until confirmed!
    }

    await transfer.save();
    await logAudit({
      req,
      action: 'transfer.request',
      targetType: 'Transfer',
      targetId: transfer._id,
      details: { propertyId, sellerId, txHash, status: transfer.status },
    });

    res.status(201).json({
      success: true,
      message: transfer.status === 'Initiated'
        ? 'Transfer request created and confirmed on-chain'
        : 'Transfer request submitted, pending on-chain confirmation',
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
    const { transferId, txHash } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.fromUserId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only the property seller can approve'));
    }
    if (transfer.status !== 'Initiated') {
      return next(new ApiError(400, 'Seller has already approved or transfer is past this stage'));
    }

    transfer.sellerApproved = true;
    transfer.status = 'sellerApproved';
    transfer.sellerApprovalTxHash = txHash;
    pushTimeline(transfer, 'Seller Approved', req.user, 'Seller agreed to the transfer');
    await transfer.save();

    // Notify buyer
    await Notification.create({
      receiver: transfer.toUserId,
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
    const { transferId, txHash } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) return next(new ApiError(404, 'Transfer not found'));

    if (transfer.toUserId.toString() !== req.user._id.toString()) {
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
    transfer.buyerApprovalTxHash = txHash;
    pushTimeline(transfer, 'Buyer Signed', req.user, 'Buyer signed and approved the transfer');
    await transfer.save();

    // Notify seller and the officers who need to perform the next review.
    await Notification.create({
      receiver: transfer.fromUserId,
      userId: transfer.fromUserId,
      title: 'Buyer Approved Transfer',
      message: 'The buyer has signed and approved the property transfer.',
      type: 'Transfer Update',
      relatedEntityType: 'Transfer',
      relatedEntityId: transfer._id,
    });
    const reviewers = await User.find({ role: { $in: ['officer', 'registrar', 'admin'] }, kycStatus: { $ne: 'suspended' } }).select('_id');
    if (reviewers.length) {
      await Notification.insertMany(reviewers.map(({ _id }) => ({
        receiver: _id,
        userId: _id,
        title: 'Transfer Ready for Review',
        message: 'A buyer has signed a property transfer and it is ready for officer approval.',
        type: 'Transfer Update',
        relatedEntityType: 'Transfer',
        relatedEntityId: transfer._id,
      })));
    }

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
    if (!transfer.buyerApproved) {
      return next(new ApiError(400, 'Buyer must sign before the officer can approve the transfer'));
    }

    transfer.officerApproved = true;
    transfer.status = 'pendingConfirmation';
    transfer.officerApprovalTxHash = txHash;
    transfer.blockchainTxHash = txHash;
    pushTimeline(transfer, 'Officer Approved', req.user, 'Government officer approved the transfer');
    await transfer.save();
    
    if (txHash) {
      const pId = transfer.propertyId || transfer.property;
      if (pId) {
        await Property.findByIdAndUpdate(pId, {
          'blockchain.txHash': txHash,
          'blockchain.chainNetwork': 'Arbitrum Sepolia',
        });
      }
    }

    // Notify both parties
    const msg = 'Government officer has approved the property transfer.';
    await Notification.insertMany([
      { receiver: transfer.fromUserId, userId: transfer.fromUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
      { receiver: transfer.toUserId, userId: transfer.toUserId, title: 'Officer Approved', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    ]);

    await logAudit({
      req,
      action: 'transfer.officer_approve',
      targetType: 'Transfer',
      targetId: transfer._id,
    });

    res.status(200).json({
      success: true,
      message: 'Officer approval recorded, pending on-chain confirmation',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

export const executeTransferCompletion = async (transferId, actorUser) => {
  const transfer = await Transfer.findById(transferId).populate('propertyId');
  if (!transfer) throw new Error('Transfer not found');
  
  if (transfer.status === 'completed') {
    return transfer; // Idempotent return
  }

  const targetPropertyId = transfer.propertyId?._id || transfer.propertyId || transfer.property?._id || transfer.property;
  const property = await Property.findById(targetPropertyId);
  
  if (property) {
    if (property.ownerId || property.owner) {
      property.previousOwners = property.previousOwners || [];
      property.previousOwners.push(property.ownerId || property.owner);
    }
    property.ownerId = transfer.toUserId || transfer.buyer;
    property.owner = transfer.toUserId || transfer.buyer;
    
    const buyer = await User.findById(transfer.toUserId).select('walletAddress');
    property.currentOwnerWallet = buyer?.walletAddress || null;
    property.isListed = false;
    await property.save();
  } else {
    console.warn(`[executeTransferCompletion] Property not found for targetPropertyId: ${targetPropertyId}`);
  }

  transfer.status = 'completed';
  transfer.completedAt = new Date();
  pushTimeline(transfer, 'Transfer Completed', actorUser, 'Ownership officially transferred');
  await transfer.save();

  const msg = 'Property transfer has been completed successfully.';
  await Notification.insertMany([
    { receiver: transfer.fromUserId, userId: transfer.fromUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
    { receiver: transfer.toUserId, userId: transfer.toUserId, title: 'Transfer Completed', message: msg, type: 'Transfer Update', relatedEntityType: 'Transfer', relatedEntityId: transfer._id },
  ]);

  return transfer;
};

// Helper removed: background monitoring doesn't work in Vercel serverless

// =====================================================
// @desc    Complete the transfer manually/fallback
// @route   POST /api/transfers/complete
// @access  Private (officer, admin)
// =====================================================
const completeTransfer = async (req, res, next) => {
  try {
    const { transferId } = req.body;

    // Defense-in-depth: ensure only admin/officer can complete transfers
    if (!['admin', 'officer', 'registrar'].includes(req.user.role)) {
      return next(new ApiError(403, 'Only officers or admins can complete transfers'));
    }

    const transfer = await executeTransferCompletion(transferId, req.user);

    await logAudit({
      req,
      action: 'transfer.complete',
      targetType: 'Transfer',
      targetId: transfer._id,
      details: { propertyId: transfer.propertyId?._id },
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
// @route   GET /api/transfers?view=buyer|seller
// @access  Private
// =====================================================
const getTransfers = async (req, res, next) => {
  try {
    const { view } = req.query;

    let filter = {};

    // Non-admin/officer users only see transfers for the selected side.
    // 'both' accounts pick a side via the `view` query param (matches the
    // active Buyer/Seller mode chosen in the UI).
    const isStaff = ['admin', 'officer', 'registrar'].includes(req.user.role);
    if (!isStaff) {
      if (view === 'seller') {
        filter.fromUserId = req.user._id; // transfers where I am the seller
      } else if (view === 'buyer') {
        filter.toUserId = req.user._id; // transfers where I am the buyer
      } else {
        filter = {
          $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
        };
      }
    }

    // First fetch all matching transfers
    let transfers = await Transfer.find(filter)
      .populate('propertyId', 'propertyId location pricing blockchain isListed')
      .populate('fromUserId', 'name email walletAddress')
      .populate('toUserId', 'name email walletAddress')
      .sort({ createdAt: -1 });

    let stateMutated = false;

    // 1. Sync-on-read: check pendingRequest / pending transfers
    const pendingRequests = transfers.filter(
      (t) => t.status === 'pendingRequest' || t.status === 'pending'
    );
    if (pendingRequests.length > 0) {
      await Promise.allSettled(pendingRequests.map((t) => syncTransferStatus(t)));
      stateMutated = true;
    }

    // 2. Sync-on-Read: Check if any transfers are stuck in pendingConfirmation
    const pendingConfirmations = transfers.filter(t => t.status === 'pendingConfirmation' && t.blockchainTxHash);

    for (const t of pendingConfirmations) {
      try {
        // Use getTransactionReceipt (synchronous read), NOT waitForTransactionReceipt
        const receipt = await publicClient.getTransactionReceipt({ hash: t.blockchainTxHash });
        if (receipt) {
          if (receipt.status === 'success') {
            await executeTransferCompletion(t._id, req.user);
          } else {
            const transferDoc = await Transfer.findById(t._id);
            transferDoc.status = 'failedConfirmation';
            pushTimeline(transferDoc, 'Transaction Failed', req.user, 'Smart contract execution reverted');
            await transferDoc.save();
          }
          stateMutated = true;
        }
      } catch (err) {
        // Block might not be mined yet, or RPC error. Safely ignore and it will remain pending.
        if (err.name !== 'TransactionReceiptNotFoundError') {
          console.error(`[Sync-on-Read] Error checking receipt for tx ${t.blockchainTxHash}:`, err);
        }
      }
    }

    // Refetch if we mutated state during reconciliation
    if (stateMutated) {
      transfers = await Transfer.find(filter)
        .populate('propertyId', 'propertyId location pricing blockchain isListed')
        .populate('fromUserId', 'name email walletAddress')
        .populate('toUserId', 'name email walletAddress')
        .sort({ createdAt: -1 });
    }

    // Expose friendly aliases so the existing UI (which reads t.buyer,
    // t.seller, t.property) keeps working regardless of role.
    const data = transfers.map((t) => {
      const doc = t.toObject();
      doc.buyer = doc.toUserId;
      doc.seller = doc.fromUserId;
      doc.property = doc.propertyId;
      return doc;
    });

    res.status(200).json({
      success: true,
      message: 'Transfers retrieved',
      data,
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
