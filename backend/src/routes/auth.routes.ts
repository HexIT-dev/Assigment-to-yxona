import { Router } from 'express';
import { register, login, verifyOTP, requestCode, getCurrentUser } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-code', requestCode);
router.post('/verify-otp', verifyOTP);
router.get('/me', auth, getCurrentUser);

export default router;
