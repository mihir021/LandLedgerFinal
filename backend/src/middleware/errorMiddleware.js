import { logger } from '../utils/logger.js';

/**
 * Centralized error-handling middleware.
 * Catches all errors thrown or passed via next(err) and returns a
 * uniform JSON response.
 */
const errorHandler = (err, _req, res, _next) => {
  // Default to 500 if no status code was set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ---- Mongoose-specific errors ----

  // Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    statusCode = 409;
    message = `Duplicate value for field: ${field}`;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${statusCode} — ${message}`);
    if (err.stack) logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Catch-all for undefined routes.
 */
const notFound = (req, _res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { errorHandler, notFound };
