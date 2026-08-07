import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user.
 *
 * @param {Object} user - Mongoose user document (must have _id and role)
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export default generateToken;
