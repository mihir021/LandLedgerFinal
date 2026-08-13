import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/analytics?range=30d|90d|1y|all
router.get('/', protect, authorize('admin'), getAnalytics);

export default router;
