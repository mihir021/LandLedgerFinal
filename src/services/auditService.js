/**
 * Audit Log Service
 * Retrieving the platform audit trail (admin only).
 */
import api from './api';

/**
 * Get audit logs with optional filters.
 * @param {Object} params - { action, userEmail, page, limit }
 * @returns {{ logs, pagination }}
 */
export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get('/audit-logs', { params });
  return data.data;
};
