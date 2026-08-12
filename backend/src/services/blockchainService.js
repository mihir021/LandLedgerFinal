import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

const RPC_URL = process.env.RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';

/**
 * Fetch the transaction receipt directly from the RPC node.
 * @param {string} txHash - 0x-prefixed transaction hash
 * @returns {Promise<{ status: 'success' | 'reverted' | 'pending' | 'unknown', receipt?: object, error?: string }>}
 */
export const getTransactionReceipt = async (txHash) => {
  if (!txHash || !txHash.startsWith('0x')) {
    return { status: 'unknown', error: 'Invalid transaction hash' };
  }

  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'RPC error');
    }

    const receipt = data.result;
    if (!receipt) {
      // Transaction is still pending / in mempool
      return { status: 'pending', receipt: null };
    }

    // status: 0x1 = success, 0x0 = reverted
    const statusHex = receipt.status;
    if (statusHex === '0x1' || statusHex === 1 || statusHex === true) {
      return { status: 'success', receipt };
    } else if (statusHex === '0x0' || statusHex === 0 || statusHex === false) {
      return { status: 'reverted', receipt };
    }

    return { status: 'unknown', receipt };
  } catch (error) {
    logger.warn(`Failed to check tx receipt for ${txHash}: ${error.message}`);
    return { status: 'unknown', error: error.message };
  }
};

/**
 * Sync-on-read helper for a single transfer.
 * Promotes pending transfers to 'Initiated' and delists property if on-chain tx succeeded.
 * Rejects transfer and keeps property listed if tx reverted or dropped.
 *
 * @param {object} transfer - Mongoose Transfer document
 * @returns {Promise<object>} updated transfer document
 */
export const syncTransferStatus = async (transfer) => {
  if (!transfer) return transfer;

  const currentStatus = transfer.status;
  // Only sync transfers that are in unconfirmed pending state
  if (currentStatus !== 'pendingRequest' && currentStatus !== 'pending') {
    return transfer;
  }

  const txHash = transfer.buyerRequestTxHash || transfer.blockchainTxHash || transfer.transactionHash;
  if (!txHash) {
    return transfer;
  }

  const check = await getTransactionReceipt(txHash);

  const targetPropertyId = transfer.propertyId?._id || transfer.propertyId;
  const property = targetPropertyId ? await Property.findById(targetPropertyId) : null;

  if (check.status === 'success') {
    transfer.status = 'Initiated';
    transfer.timeline.push({
      stage: 'On-Chain Confirmed',
      actorName: 'Blockchain Verifier',
      note: `Transaction ${txHash} confirmed on-chain. Transfer initiated.`,
      timestamp: new Date(),
    });

    // Delist property now that transfer request is confirmed on-chain
    if (property && property.isListed) {
      property.isListed = false;
      await property.save();
    }

    // Notify seller if not already notified
    const existingNotification = await Notification.findOne({
      relatedEntityType: 'Transfer',
      relatedEntityId: transfer._id,
      title: 'New Transfer Request',
    });

    if (!existingNotification && transfer.fromUserId) {
      await Notification.create({
        receiver: transfer.fromUserId,
        title: 'New Transfer Request',
        message: `A buyer has requested to purchase property ${property?.propertyId || 'listed on LandLedger'}.`,
        type: 'Transfer Update',
        relatedEntityType: 'Transfer',
        relatedEntityId: transfer._id,
      });
    }

    await transfer.save();
  } else if (check.status === 'reverted') {
    transfer.status = 'Rejected';
    transfer.timeline.push({
      stage: 'Transaction Failed',
      actorName: 'Blockchain Verifier',
      note: `On-chain transaction ${txHash} reverted or failed. Transfer rejected.`,
      timestamp: new Date(),
    });

    // Ensure property remains listed
    if (property && !property.isListed) {
      property.isListed = true;
      await property.save();
    }

    await transfer.save();
  } else if (check.status === 'pending') {
    // Check for timeout (> 2 hours pending without mining)
    const initiatedAt = transfer.initiatedAt || transfer.createdAt || new Date();
    const ageMs = Date.now() - new Date(initiatedAt).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    if (ageMs > twoHoursMs) {
      transfer.status = 'Rejected';
      transfer.timeline.push({
        stage: 'Transaction Expired',
        actorName: 'Blockchain Verifier',
        note: `On-chain transaction timed out after 2 hours without confirmation.`,
        timestamp: new Date(),
      });

      if (property && !property.isListed) {
        property.isListed = true;
        await property.save();
      }

      await transfer.save();
    }
  }

  return transfer;
};
