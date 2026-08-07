import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
} from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateCreateProperty,
  validateUpdateProperty,
  validateMongoId,
} from '../middleware/validationMiddleware.js';
import { uploadImages, uploadDocuments } from '../middleware/uploadMiddleware.js';
import multer from 'multer';

const router = Router();

// Combine image + document uploads into a single middleware
const uploadPropertyFiles = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) return next(err);
    // Store images that were already parsed
    const images = req.files || [];
    uploadDocuments(req, res, (err2) => {
      if (err2) return next(err2);
      // Merge: uploadDocuments overwrites req.files, so we combine
      req.files = {
        images,
        documents: req.files || [],
      };
      next();
    });
  });
};

// Public — anyone can browse properties
router.get('/', getProperties);
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
