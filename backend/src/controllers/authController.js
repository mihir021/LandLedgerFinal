import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

// =====================================================
// @desc    Register a new user (buyer, seller, or both)
// @route   POST /api/auth/register
// @access  Public
// =====================================================
const register = async (req, res, next) => {
  try {
    const { fullName, name, email, password, phone, aadhaarNumber, role } = req.body;

    // Support both fullName and name from frontend
    const finalName = name || fullName;

    // Regular users may self-register as buyer, seller, or both.
    // New accounts default to 'both' so everyone can buy AND sell.
    if (role && !['buyer', 'seller', 'both'].includes(role)) {
      return next(
        new ApiError(403, 'Only buyer, seller, or both roles can self-register')
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'Email is already registered'));
    }

    // Construct new user structure
    const user = await User.create({
      name: finalName,
      email,
      passwordHash: password,
      phone,
      govtId: aadhaarNumber ? { type: 'Aadhaar', numberHash: aadhaarNumber } : undefined,
      role: role || 'both',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // backward compatibility
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        status: user.kycStatus, // backward compatibility
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

    // Find user and explicitly include the password fields
    const user = await User.findOne({ email }).select('+passwordHash +password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (user.status === 'suspended') {
      return next(
        new ApiError(403, 'Account suspended — contact the administrator')
      );
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // backward compatibility
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        status: user.kycStatus, // backward compatibility
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

    // Attach backward compatibility fields if necessary, or just return user
    const userData = user.toObject();
    userData.fullName = userData.name;
    userData.status = userData.kycStatus;

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe };
