/**
 * Auth Service
 * Handles login, registration, and current-user retrieval.
 */
import api from './api';

/**
 * Login with email and password.
 * @returns {{ _id, fullName, email, role, status, token }}
 */
export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { _id, fullName, email, role, status, token }
};

/**
 * Register a new user (buyer or seller only).
 * @param {{ fullName, email, password, phone?, aadhaarNumber?, role? }} payload
 * @returns {{ _id, fullName, email, role, status, token }}
 */
export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
};

/**
 * Get the currently authenticated user profile.
 * @returns {Object} Full user document (minus password).
 */
export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};
