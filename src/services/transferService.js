/**
 * Transfer Service
 * Property ownership transfer operations.
 */
import api from './api';

/**
 * Get all transfers scoped to the current user's role.
 * @returns {Array} Transfer documents.
 */
export const getTransfers = async () => {
  const { data } = await api.get('/transfers');
  return data.data;
};

/**
 * Buyer requests a property transfer.
 * @param {{ propertyId: string, sellerId: string }} payload
 * @returns {Object} Created transfer document.
 */
export const requestTransfer = async ({ propertyId, sellerId }) => {
  const { data } = await api.post('/transfers/request', { propertyId, sellerId });
  return data.data;
};

/**
 * Seller approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const sellerApprove = async (transferId) => {
  const { data } = await api.post('/transfers/seller-approve', { transferId });
  return data.data;
};

/**
 * Buyer signs / approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const buyerApprove = async (transferId) => {
  const { data } = await api.post('/transfers/buyer-approve', { transferId });
  return data.data;
};

/**
 * Officer approves a transfer.
 * @param {string} transferId
 * @returns {Object} Updated transfer document.
 */
export const officerApprove = async (transferId) => {
  const { data } = await api.post('/transfers/officer-approve', { transferId });
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
