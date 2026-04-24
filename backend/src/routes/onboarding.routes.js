import express from 'express';
import { saveMetrics, getRecommendations } from '../controllers/onboarding.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, saveMetrics);
router.get('/recommendations', verifyToken, getRecommendations);

export default router;
