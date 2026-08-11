import ApiError from '../utils/ApiError.js';

/**
 * Role-based authorization middleware factory.
 *
 * A user's `role` may grant more than one capability:
 *   - 'both'  → acts as buyer AND seller
 *   - 'registrar' → alias for 'officer'
 *
 * Usage:
 *   authorize('admin')              — admin only
 *   authorize('admin', 'officer')   — admin OR officer
 *   authorize('seller', 'buyer')    — seller OR buyer
 *   authorize('buyer')              — buyer OR 'both' accounts
 *
 * @param  {...string} allowedRoles - One or more roles that may access the route
 * @returns {Function} Express middleware
 */

// Expand a role into the set of capabilities it grants.
const roleCapabilities = (role) => {
  if (role === 'both') return ['buyer', 'seller'];
  if (role === 'registrar') return ['officer'];
  return [role];
};

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized — please log in first'));
    }

    const granted = roleCapabilities(req.user.role);
    if (!granted.some((cap) => allowedRoles.includes(cap))) {
      return next(
        new ApiError(
          403,
          `Role "${req.user.role}" is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export { authorize };
