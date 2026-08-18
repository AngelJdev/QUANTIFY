import { Router } from 'express';
import {
    requestPairingCode,
    checkPairingStatus,
    verifyPairingCode,
    getSmartTVDashboard,
    unlinkSmartTV
} from '../controllers/smarttv.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas Públicas (Llamadas por la App Android TV)
router.post('/request-code', requestPairingCode);
router.post('/check-status', checkPairingStatus);

// Rutas Privadas (Llamadas por la App Web / Móvil autenticada)
router.post('/verify-code', verifyToken, verifyPairingCode);
router.get('/dashboard', verifyToken, getSmartTVDashboard);
router.post('/unlink', verifyToken, unlinkSmartTV);

export default router;
