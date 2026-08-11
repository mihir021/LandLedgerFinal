import AuditLog from '../models/AuditLog.js';

// =====================================================
// @desc    Get audit logs (admin only)
// @route   GET /api/audit-logs
// @access  Private (admin)
// =====================================================
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, userEmail, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (userEmail) filter.userEmail = { $regex: userEmail, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved',
      data: {
        logs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getAuditLogs };
