import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated users can read settings (used in Profile, admin pages, etc.)
router.get('/', protect, getSettings);

// Only admins can update settings
router.put('/', protect, authorize('admin'), updateSettings);

export default router;
