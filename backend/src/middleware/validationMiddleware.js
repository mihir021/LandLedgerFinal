import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// =====================================================
// Shared handler — checks for validation errors and
// returns a 400 response with all messages joined.
// =====================================================

const handleValidationErrors = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages.join(', ')));
  }
  next();
};

// =====================================================
// Auth validations
// =====================================================

const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim(),
  body('aadhaarNumber').optional().trim(),
  body('role')
    .optional()
    .isIn(['buyer', 'seller'])
    .withMessage('Only buyer and seller roles can self-register'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// =====================================================
// Property validations
// =====================================================

const validateCreateProperty = [
  body('surveyNumber')
    .trim()
    .notEmpty()
    .withMessage('Survey number is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('landType')
    .trim()
    .notEmpty()
    .withMessage('Land type is required')
    .isIn(['agricultural', 'residential', 'commercial', 'industrial', 'mixed'])
    .withMessage('Invalid land type'),
  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isFloat({ gt: 0 })
    .withMessage('Area must be a positive number'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('description').optional().trim(),
  body('latitude').optional().isFloat().withMessage('Latitude must be a number'),
  body('longitude')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a number'),
  handleValidationErrors,
];

const validateUpdateProperty = [
  param('id').isMongoId().withMessage('Invalid property ID'),
  body('surveyNumber').optional().trim().notEmpty().withMessage('Survey number cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('landType')
    .optional()
    .isIn(['agricultural', 'residential', 'commercial', 'industrial', 'mixed'])
    .withMessage('Invalid land type'),
  body('area')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Area must be a positive number'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors,
];

// =====================================================
// Transfer validations
// =====================================================

const validateTransferRequest = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid property ID'),
  body('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isMongoId()
    .withMessage('Invalid seller ID'),
  handleValidationErrors,
];

const validateTransferAction = [
  body('transferId')
    .notEmpty()
    .withMessage('Transfer ID is required')
    .isMongoId()
    .withMessage('Invalid transfer ID'),
  handleValidationErrors,
];

// =====================================================
// ID param validation
// =====================================================

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

export {
  validateRegister,
  validateLogin,
  validateCreateProperty,
  validateUpdateProperty,
  validateTransferRequest,
  validateTransferAction,
  validateMongoId,
};
