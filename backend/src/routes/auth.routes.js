import { Router } from 'express';
import { register, login, getProfile, forgotPassword, resetPassword, googleLogin, sendVerification } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.get('/profile', verifyToken, getProfile);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/send-verification', sendVerification);
router.post('/google', googleLogin);

export default router;
