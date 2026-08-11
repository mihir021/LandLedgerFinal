import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All audit log routes are protected (admin only)
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAuditLogs);

export default router;
