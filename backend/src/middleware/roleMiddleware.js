import ApiError from '../utils/ApiError.js';

/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   authorize('admin')              — admin only
 *   authorize('admin', 'officer')   — admin OR officer
 *   authorize('seller', 'buyer')    — seller OR buyer
 *
 * @param  {...string} allowedRoles - One or more roles that may access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized — please log in first'));
    }

    if (!allowedRoles.includes(req.user.role)) {
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
