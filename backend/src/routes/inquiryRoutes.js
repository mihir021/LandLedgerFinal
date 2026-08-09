import express from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Optional Auth endpoint to submit inquiries
router.post('/', optionalProtect, createInquiry);

// Protected endpoints for managing inquiries
router.get('/', protect, getInquiries);
router.get('/:id', protect, getInquiryById);
router.patch('/:id', protect, updateInquiryStatus);
router.delete('/:id', protect, deleteInquiry);

export default router;
