import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

// =====================================================
// @desc    Register a new user (buyer or seller only)
// @route   POST /api/auth/register
// @access  Public
// =====================================================
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, aadhaarNumber, role } = req.body;

    // Only buyer and seller may self-register
    if (role && !['buyer', 'seller'].includes(role)) {
      return next(
        new ApiError(403, 'Only buyer and seller roles can self-register')
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'Email is already registered'));
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      aadhaarNumber,
      role: role || 'buyer',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// =====================================================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// =====================================================
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe };
