import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

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
    if (status) filter.status = status;

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

    // Handle profile image upload
    if (req.file) {
      req.body.profileImage = req.file.path;
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
      { status },
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

export { getUsers, getUserById, updateUser, verifyUser, deleteUser };
