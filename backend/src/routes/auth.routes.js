import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/profile', verifyToken, getProfile);

export default router;
