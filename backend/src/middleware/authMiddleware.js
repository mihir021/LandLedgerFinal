import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Protect routes — verifies the JWT from the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
const protect = async (req, _res, next) => {
  try {
    let token;

    // 1. Extract token from "Bearer <token>" header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback: check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized — no token provided'));
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user (exclude password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists'));
    }

    if (user.status === 'suspended') {
      return next(new ApiError(403, 'Account suspended — contact the administrator'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized — invalid token'));
  }
};

/**
 * Optional Auth middleware — attaches req.user if a valid token exists,
 * but does not reject requests if no token is provided.
 */
const optionalProtect = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (_err) {
    // Ignore invalid token in optional mode
  }
  next();
};

export { protect, optionalProtect };
