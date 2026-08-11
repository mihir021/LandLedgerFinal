/**
 * Settings Service
 * Platform settings retrieval and updates (admin only for writes).
 */
import api from './api';

/**
 * Get platform settings.
 * @returns {Object} Settings key/value map.
 */
export const getSettings = async () => {
  const { data } = await api.get('/settings');
  return data.data;
};

/**
 * Update platform settings (admin only).
 * @param {Object} settings - Partial settings key/value map.
 * @returns {Object} Updated settings map.
 */
export const updateSettings = async (settings) => {
  const { data } = await api.put('/settings', { settings });
  return data.data;
};
