/**
 * User Service
 * Admin user management operations.
 */
import api from './api';

/**
 * Get all users (admin only) with optional filters.
 * @param {Object} params - { role, status, page, limit }
 * @returns {{ users, pagination }}
 */
export const getUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data.data;
};

/**
 * Get a single user by ID (admin only).
 * @param {string} id
 * @returns {Object} User document.
 */
export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data;
};

/**
 * Verify or reject a user (admin/officer).
 * @param {string} id
 * @param {'verified'|'rejected'} status
 * @returns {Object} Updated user document.
 */
export const verifyUser = async (id, status) => {
  const { data } = await api.put(`/users/${id}/verify`, { status });
  return data.data;
};

/**
 * Delete a user (admin only).
 * @param {string} id
 */
export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};
