/**
 * Notification Service
 * Notification retrieval and management operations.
 */
import api from './api';

/**
 * Get notifications for the logged-in user.
 * @returns {Array} Notification documents.
 */
export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data.data;
};

/**
 * Mark a single notification as read.
 * @param {string} id
 * @returns {Object} Updated notification.
 */
export const markAsRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = async () => {
  await api.put('/notifications/read-all');
};

/**
 * Delete a notification.
 * @param {string} id
 */
export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};
