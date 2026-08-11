import Dispute from '../models/Dispute.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';

// =====================================================
// @desc    File a dispute on a property
// @route   POST /api/disputes
// @access  Private
// =====================================================
const createDispute = async (req, res, next) => {
  try {
    const { property, subject, description } = req.body;

    if (!property || !subject || !description) {
      return next(new ApiError(400, 'Property, subject and description are required'));
    }

    // Prevent duplicate open disputes on the same property by the same raiser
    const existing = await Dispute.findOne({
      property,
      raiser: req.user._id,
      status: { $in: ['open', 'in-progress'] },
    });
    if (existing) {
      return next(new ApiError(409, 'An open dispute already exists for this property'));
    }

    const dispute = await Dispute.create({
      property,
      raiser: req.user._id,
      subject,
      description,
    });

    await logAudit({
      req,
      action: 'dispute.create',
      targetType: 'Dispute',
      targetId: dispute._id,
      details: { property, subject },
    });

    res.status(201).json({
      success: true,
      message: 'Dispute filed successfully',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get all disputes (officer/admin: all, others: own)
// @route   GET /api/disputes
// @access  Private
// =====================================================
const getDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    // Non-officer/admin users only see their own disputes
    if (!['admin', 'officer'].includes(req.user.role)) {
      filter.raiser = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Dispute.countDocuments(filter);

    const disputes = await Dispute.find(filter)
      .populate('property', 'propertyId surveyNumber address city district state')
      .populate('raiser', 'fullName email')
      .populate('resolvedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Disputes retrieved',
      data: {
        disputes,
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

// =====================================================
// @desc    Get a single dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
// =====================================================
const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('property')
      .populate('raiser', 'fullName email')
      .populate('resolvedBy', 'fullName email');

    if (!dispute) return next(new ApiError(404, 'Dispute not found'));

    // Non-officer/admin can only view their own disputes
    if (
      !['admin', 'officer'].includes(req.user.role) &&
      dispute.raiser.toString() !== req.user._id.toString()
    ) {
      return next(new ApiError(403, 'Not authorized to view this dispute'));
    }

    res.status(200).json({
      success: true,
      message: 'Dispute retrieved',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Update dispute status / resolve (officer, admin)
// @route   PUT /api/disputes/:id
// @access  Private (officer, admin)
// =====================================================
const updateDispute = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    if (!['in-progress', 'resolved', 'rejected', 'closed'].includes(status)) {
      return next(new ApiError(400, 'Invalid dispute status'));
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return next(new ApiError(404, 'Dispute not found'));

    dispute.status = status;
    if (resolution !== undefined) dispute.resolution = resolution;

    if (['resolved', 'rejected', 'closed'].includes(status)) {
      dispute.resolvedBy = req.user._id;
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    // Notify the raiser about the outcome
    if (['resolved', 'rejected', 'closed'].includes(status)) {
      await Notification.create({
        receiver: dispute.raiser,
        title: `Dispute ${status}`,
        message: `Your dispute "${dispute.subject}" has been marked as ${status}.`,
        type: 'dispute',
      });
    }

    await logAudit({
      req,
      action: 'dispute.update',
      targetType: 'Dispute',
      targetId: dispute._id,
      details: { status, resolution },
    });

    res.status(200).json({
      success: true,
      message: `Dispute marked as ${status}`,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Delete a dispute (admin only)
// @route   DELETE /api/disputes/:id
// @access  Private (admin)
// =====================================================
const deleteDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findByIdAndDelete(req.params.id);
    if (!dispute) return next(new ApiError(404, 'Dispute not found'));

    await logAudit({
      req,
      action: 'dispute.delete',
      targetType: 'Dispute',
      targetId: dispute._id,
    });

    res.status(200).json({
      success: true,
      message: 'Dispute deleted',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export { createDispute, getDisputes, getDisputeById, updateDispute, deleteDispute };
