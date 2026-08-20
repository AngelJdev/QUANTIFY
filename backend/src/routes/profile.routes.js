import express from 'express';
import {
    updateName,
    updateAvatar,
    updateBiometrics,
    updateBio,
    changePasswordDirect,
    requestEmailChange,
    confirmEmailChange
} from '../controllers/profile.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas de perfil requieren estar autenticado
router.patch('/name', verifyToken, updateName);
router.patch('/avatar', verifyToken, updateAvatar);
router.patch('/biometrics', verifyToken, updateBiometrics);
router.patch('/bio', verifyToken, updateBio);
router.patch('/change-password', verifyToken, changePasswordDirect);
router.post('/request-email-change', verifyToken, requestEmailChange);
router.post('/confirm-email-change', verifyToken, confirmEmailChange);

export default router;
