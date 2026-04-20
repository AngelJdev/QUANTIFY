import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import User from '../models/user.model.js';
import Habit from '../models/habit.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Todas las rutas de admin requieren ser admin
router.use(verifyToken, isAdmin);

router.get('/users', async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email', 'rol', 'fecha_creacion']
        });
        return sendSuccess(res, 200, 'Lista de usuarios', users);
    } catch (error) {
        next(error);
    }
});

router.get('/stats', async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalHabits = await Habit.count();
        return sendSuccess(res, 200, 'Estadísticas del sistema', {
            totalUsers,
            totalHabits
        });
    } catch (error) {
        next(error);
    }
});

export default router;
