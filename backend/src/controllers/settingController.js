import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';

// Default settings applied when none exist in the DB
const DEFAULT_SETTINGS = {
  platformName: 'LandLedger',
  platformDescription:
    'A blockchain-powered land registry for transparent and secure property transactions.',
  supportEmail: 'support@landledger.com',
  supportPhone: '+91 12345 67890',
  maintenanceMode: false,
  allowPublicRegistration: true,
  maxTransferFee: 0.5,
};

// =====================================================
// @desc    Get platform settings
// @route   GET /api/settings
// @access  Private
// =====================================================
const getSettings = async (_req, res, next) => {
  try {
    const settings = await Setting.find({});

    // Merge defaults so missing keys still return a sensible value
    const merged = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => {
      merged[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      message: 'Settings retrieved',
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Update platform settings (admin only)
// @route   PUT /api/settings
// @access  Private (admin)
// =====================================================
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return next(new ApiError(400, 'Settings object is required'));
    }

    // Upsert each provided key
    const operations = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));

    await Setting.bulkWrite(operations);

    await logAudit({
      req,
      action: 'settings.update',
      targetType: 'Setting',
      details: { keys: Object.keys(settings) },
    });

    const updated = await Setting.find({});
    const merged = { ...DEFAULT_SETTINGS };
    updated.forEach((s) => {
      merged[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings, DEFAULT_SETTINGS };
