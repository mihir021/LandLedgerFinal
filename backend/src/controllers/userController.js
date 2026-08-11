import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';

// =====================================================
// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
// =====================================================
const getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.kycStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: {
        users,
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
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (admin)
// =====================================================
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (self or admin)
// =====================================================
const updateUser = async (req, res, next) => {
  try {
    // Only admin or the user themselves can update
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to update this user'));
    }

    // Prevent role escalation for non-admins
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }

    // Never allow password update through this route
    delete req.body.password;
    delete req.body.passwordHash;

    // Backward compatibility for fullName and aadhaarNumber
    if (req.body.fullName) {
      req.body.name = req.body.fullName;
      delete req.body.fullName;
    }
    if (req.body.aadhaarNumber) {
      req.body.govtId = { type: 'Aadhaar', numberHash: req.body.aadhaarNumber };
      delete req.body.aadhaarNumber;
    }

    // Handle profile image upload (not in new schema, but we can leave it as sparse or ignore)
    // Actually the new schema removed profileImage, so let's delete it to prevent validation error
    if (req.file) {
      // req.body.profileImage = req.file.path; // Removed in new schema
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
      success: true,
      message: 'User updated',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Verify user (admin / officer)
// @route   PUT /api/users/:id/verify
// @access  Private (admin, officer)
// =====================================================
const verifyUser = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return next(new ApiError(400, 'Status must be "verified" or "rejected"'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus: status },
      { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
      success: true,
      message: `User ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Suspend / reinstate a user (admin only)
// @route   PUT /api/users/:id/suspend
// @access  Private (admin)
// =====================================================
const suspendUser = async (req, res, next) => {
  try {
    const { suspend } = req.body;

    if (typeof suspend !== 'boolean') {
      return next(new ApiError(400, 'suspend must be a boolean'));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    if (user.role === 'admin') {
      return next(new ApiError(400, 'Cannot suspend an administrator account'));
    }

    user.status = suspend ? 'suspended' : 'pending';
    await user.save();

    await logAudit({
      req,
      action: suspend ? 'user.suspend' : 'user.reinstate',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role },
    });

    res.status(200).json({
      success: true,
      message: suspend ? 'User suspended' : 'User reinstated',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Register a government officer (admin only)
// @route   POST /api/users/officer
// @access  Private (admin)
// =====================================================
const registerOfficer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, jurisdiction } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'Email is already registered'));
    }

    const officer = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 'officer',
      status: 'verified',
      jurisdiction: jurisdiction || null,
    });

    await logAudit({
      req,
      action: 'officer.create',
      targetType: 'User',
      targetId: officer._id,
      details: { email: officer.email, jurisdiction: officer.jurisdiction },
    });

    res.status(201).json({
      success: true,
      message: 'Government officer registered successfully',
      data: officer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin)
// =====================================================
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
      success: true,
      message: 'User deleted',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getUsers,
  getUserById,
  updateUser,
  verifyUser,
  suspendUser,
  registerOfficer,
  deleteUser,
};
