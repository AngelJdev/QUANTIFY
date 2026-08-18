import { Router } from 'express';
import { recommendHabitConfig } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint for habit configuration autocomplete using AI
router.post('/recommend-habit', verifyToken, recommendHabitConfig);

export default router;
