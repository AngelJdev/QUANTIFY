import { Router } from 'express';
import { createLog, getLogsByHabit, getAdherenceStats, getGlobalStats } from '../controllers/log.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { logValidator } from '../validators/log.validator.js';

const router = Router();

router.use(verifyToken);

router.post('/', logValidator, validateRequest, createLog);
router.get('/habit/:habitId', getLogsByHabit);
router.get('/adherence/:habitId', getAdherenceStats);
router.get('/global-stats', getGlobalStats);

export default router;
