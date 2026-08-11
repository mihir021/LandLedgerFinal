import { Router } from 'express';
import {
  createDispute,
  getDisputes,
  getDisputeById,
  updateDispute,
  deleteDispute,
} from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateCreateDispute,
  validateUpdateDispute,
  validateMongoId,
} from '../middleware/validationMiddleware.js';

const router = Router();

// All dispute routes are protected
router.use(protect);

// Anyone authenticated can file a dispute; list is scoped per role in controller
router.post('/', validateCreateDispute, createDispute);
router.get('/', getDisputes);

router.get('/:id', validateMongoId, getDisputeById);

// Officer / Admin resolves disputes
router.put(
  '/:id',
  authorize('officer', 'admin'),
  validateMongoId,
  validateUpdateDispute,
  updateDispute
);

// Admin only: delete a dispute
router.delete('/:id', authorize('admin'), validateMongoId, deleteDispute);

export default router;
