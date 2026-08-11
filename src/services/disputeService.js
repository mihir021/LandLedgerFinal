/**
 * Dispute Service
 * Filing and managing property disputes.
 */
import api from './api';

/**
 * Get disputes (officer/admin: all, others: own).
 * @param {Object} params - { status, page, limit }
 * @returns {{ disputes, pagination }}
 */
export const getDisputes = async (params = {}) => {
  const { data } = await api.get('/disputes', { params });
  return data.data;
};

/**
 * File a new dispute on a property.
 * @param {{ property: string, subject: string, description: string }} payload
 * @returns {Object} Created dispute document.
 */
export const createDispute = async ({ property, subject, description }) => {
  const { data } = await api.post('/disputes', { property, subject, description });
  return data.data;
};

/**
 * Update dispute status / resolution (officer/admin).
 * @param {string} id
 * @param {{ status: string, resolution?: string }} payload
 * @returns {Object} Updated dispute document.
 */
export const updateDispute = async (id, payload) => {
  const { data } = await api.put(`/disputes/${id}`, payload);
  return data.data;
};

/**
 * Delete a dispute (admin only).
 * @param {string} id
 */
export const deleteDispute = async (id) => {
  await api.delete(`/disputes/${id}`);
};
