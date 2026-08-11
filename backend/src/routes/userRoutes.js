import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  verifyUser,
  suspendUser,
  registerOfficer,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateMongoId,
  validateSuspendUser,
  validateRegisterOfficer,
} from '../middleware/validationMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// All user management routes are protected
router.use(protect);

// Admin: register a new government officer
router.post(
  '/officer',
  authorize('admin'),
  validateRegisterOfficer,
  registerOfficer
);

// Admin and Officer: list all users
router.get('/', authorize('admin', 'officer'), getUsers);

// Admin: get specific user
router.get('/:id', authorize('admin'), validateMongoId, getUserById);

// Self or Admin: update user profile
router.put('/:id', uploadProfileImage, validateMongoId, updateUser);

// Admin / Officer: verify user
router.put('/:id/verify', authorize('admin', 'officer'), validateMongoId, verifyUser);

// Admin: suspend / reinstate user
router.put(
  '/:id/suspend',
  authorize('admin'),
  validateMongoId,
  validateSuspendUser,
  suspendUser
);

// Admin-only: delete user
router.delete('/:id', authorize('admin'), validateMongoId, deleteUser);

export default router;
