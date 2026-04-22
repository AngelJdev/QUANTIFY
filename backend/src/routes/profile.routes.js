import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    updateName,
    updateAvatar,
    requestEmailChange,
    confirmEmailChange
} from '../controllers/profile.controller.js';

const router = Router();

// All profile routes require authentication
router.use(verifyToken);

router.patch('/name',                 updateName);
router.patch('/avatar',               updateAvatar);
router.post('/request-email-change',  requestEmailChange);
router.post('/confirm-email-change',  confirmEmailChange);

export default router;
