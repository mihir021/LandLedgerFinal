import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  toggleListing,
  getPropertyHistory,
  getSignedDocumentUrl,
} from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateCreateProperty,
  validateUpdateProperty,
  validateMongoId,
} from '../middleware/validationMiddleware.js';
import { uploadPropertyFiles } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public — anyone can browse properties
router.get('/document-proxy', getSignedDocumentUrl);
router.get('/', getProperties);
router.get('/:id/history', validateMongoId, getPropertyHistory);
router.get('/:id', validateMongoId, getPropertyById);

// Seller creates, updates, deletes
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  uploadPropertyFiles,
  validateCreateProperty,
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  uploadPropertyFiles,
  validateUpdateProperty,
  updateProperty
);

// Seller toggles listing on/off
router.put(
  '/:id/listing',
  protect,
  authorize('seller', 'admin'),
  validateMongoId,
  toggleListing
);

router.delete(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  validateMongoId,
  deleteProperty
);

// Officer / Admin verifies
router.put(
  '/:id/verify',
  protect,
  authorize('officer', 'admin'),
  validateMongoId,
  verifyProperty
);

export default router;
