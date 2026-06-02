import { Router } from 'express';
import { getAdminAnalytics, getOwnerAnalytics } from '../controllers/analytics.controller';
import { auth, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/admin', auth, adminOnly, getAdminAnalytics);
router.get('/owner/:hallId', auth, getOwnerAnalytics);

export default router;
