import { Router } from 'express';
import {
  requestTransfer,
  sellerApprove,
  buyerApprove,
  officerApprove,
  completeTransfer,
  getTransfers,
} from '../controllers/transferController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateTransferRequest,
  validateTransferAction,
} from '../middleware/validationMiddleware.js';

const router = Router();

// All transfer routes are protected
router.use(protect);

// Buyer requests a transfer
router.post('/request', authorize('buyer'), validateTransferRequest, requestTransfer);

// Seller approves
router.post('/seller-approve', authorize('seller'), validateTransferAction, sellerApprove);

// Buyer approves / signs
router.post('/buyer-approve', authorize('buyer'), validateTransferAction, buyerApprove);

// Officer approves
router.post(
  '/officer-approve',
  authorize('officer', 'admin', 'registrar'),
  validateTransferAction,
  officerApprove
);

// Officer / Admin completes
router.post(
  '/complete',
  authorize('officer', 'admin', 'registrar'),
  validateTransferAction,
  completeTransfer
);

// Get all transfers (scoped per role in controller)
router.get('/', getTransfers);

export default router;
