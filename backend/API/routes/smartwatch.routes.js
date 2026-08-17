import { Router } from 'express';
import {
    generatePairingCode,
    verifyPairingCode,
    pollAuth,
    syncData,
    getDashboard,
    unlinkDevice,
    unlinkFromWatch
} from '../controllers/smartwatch.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// ═══════════════════════════════════════════
// PUBLIC ROUTES (no auth — watch doesn't have token yet)
// ═══════════════════════════════════════════

// Watch requests a pairing code to display
router.post('/generate-code', generatePairingCode);

// Watch polls to check if user authorized from the web
router.get('/poll-auth', pollAuth);

// ═══════════════════════════════════════════
// WEB-AUTHENTICATED ROUTES (user must be logged in on web)
// ═══════════════════════════════════════════

// User enters watch code on web to link their account
router.post('/verify-code', verifyToken, verifyPairingCode);

// User unlinks watch from web
router.post('/unlink', verifyToken, unlinkDevice);

// ═══════════════════════════════════════════
// WATCH-AUTHENTICATED ROUTES (watch has JWT from pairing)
// ═══════════════════════════════════════════

// Batch sync of offline actions + telemetry
router.post('/sync', verifyToken, syncData);

// Optimized dashboard endpoint (habits + stats + streak in 1 call)
router.get('/dashboard', verifyToken, getDashboard);

// Watch unlinks itself (notifies backend so web reflects the change)
router.post('/unlink-from-watch', verifyToken, unlinkFromWatch);

export default router;
