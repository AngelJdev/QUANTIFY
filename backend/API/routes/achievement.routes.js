import express from 'express';
import { getAchievements } from '../controllers/achievement.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAchievements);

export default router;
