import express from 'express';
import { saveMetrics } from '../controllers/onboarding.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, saveMetrics);

export default router;
