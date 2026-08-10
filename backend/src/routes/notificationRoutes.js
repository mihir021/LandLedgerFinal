import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateMongoId } from '../middleware/validationMiddleware.js';

const router = Router();

// All notification routes are protected
router.use(protect);

// Get current user's notifications
router.get('/', getNotifications);

// Mark all as read (placed before /:id to avoid route conflict)
router.put('/read-all', markAllAsRead);

// Mark single notification as read
router.put('/:id/read', validateMongoId, markAsRead);

// Delete a notification
router.delete('/:id', validateMongoId, deleteNotification);

export default router;
