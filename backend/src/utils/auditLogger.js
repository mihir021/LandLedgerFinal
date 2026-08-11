import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit trail entry.
 *
 * @param {object}  options
 * @param {object}  [options.req]      - Express request (used for ip + auth user)
 * @param {object}  [options.user]     - User performing the action
 * @param {string}  options.action     - Short action name (e.g. 'user.verify', 'transfer.complete')
 * @param {string}  [options.targetType] - Type of the affected entity
 * @param {string}  [options.targetId]   - ID of the affected entity
 * @param {object}  [options.details]  - Extra details to store
 */
const logAudit = async ({
  req = null,
  user = null,
  action,
  targetType = '',
  targetId = '',
  details = {},
}) => {
  try {
    const actor = user || req?.user || null;
    await AuditLog.create({
      user: actor?._id || null,
      userEmail: actor?.email || '',
      action,
      targetType,
      targetId,
      details,
      ip: req?.ip || req?.socket?.remoteAddress || '',
    });
  } catch (error) {
    // Audit logging must never break the main request flow
    console.error('Audit log error:', error.message);
  }
};

export default logAudit;
