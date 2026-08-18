import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
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

router.patch('/premium-activate', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado');
        await user.update({ is_premium: true });
        return sendSuccess(res, 200, 'Premium activado');
    } catch (err) {
        next(err);
    }
});

export default router;
