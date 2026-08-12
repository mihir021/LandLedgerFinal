/**
 * Transfer Service
 * Property ownership transfer operations.
 */
import api from './api';

/**
 * Get all transfers scoped to the current user's role/mode.
 * @param {{ view?: 'buyer' | 'seller' }} [opts] - 'both' accounts pick which
 *        side of their transfers to see (matches the active Buyer/Seller mode).
 * @returns {Array} Transfer documents.
 */
export const getTransfers = async (opts = {}) => {
  const params = new URLSearchParams();
  if (opts.view) params.set('view', opts.view);
  const qs = params.toString();
  const { data } = await api.get(`/transfers${qs ? `?${qs}` : ''}`);
  return data.data;
};

/**
 * Buyer requests a property transfer.
 * @param {{ propertyId: string, sellerId: string }} payload
 * @returns {Object} Created transfer document.
 */
export const requestTransfer = async ({ propertyId, sellerId, txHash, buyerWallet }) => {
  const { data } = await api.post('/transfers/request', { propertyId, sellerId, txHash, buyerWallet });
  return data.data;
};

/**
 * Seller approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const sellerApprove = async (transferId, txHash) => {
  const { data } = await api.post('/transfers/seller-approve', { transferId, txHash });
  return data.data;
};

/**
 * Buyer signs / approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const buyerApprove = async (transferId, txHash) => {
  const { data } = await api.post('/transfers/buyer-approve', { transferId, txHash });
  return data.data;
};

/**
 * Officer approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const officerApprove = async (transferId, txHash) => {
  const { data } = await api.post('/transfers/officer-approve', { transferId, txHash });
  return data.data;
};

/**
 * Complete a transfer (officer/admin).
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const completeTransfer = async (transferId) => {
  const { data } = await api.post('/transfers/complete', { transferId });
  return data.data;
};
