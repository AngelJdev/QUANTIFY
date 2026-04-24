import { Router } from 'express';
import { createHabit, getAllHabits, getHabitById, updateHabit, deleteHabit } from '../controllers/habit.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { habitValidator } from '../validators/habit.validator.js';

const router = Router();

// Todas las rutas requieren auth
router.use(verifyToken);

router.post('/', habitValidator, validateRequest, createHabit);
router.get('/', getAllHabits);
router.get('/:id', getHabitById);
router.put('/:id', habitValidator, validateRequest, updateHabit);
router.delete('/:id', deleteHabit);

export default router;
