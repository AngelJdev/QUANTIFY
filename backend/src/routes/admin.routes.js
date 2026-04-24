import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrMod } from '../middleware/role.middleware.js';
import User from '../models/user.model.js';
import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import UserMetric from '../models/userMetric.model.js';
import Achievement from '../models/achievement.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// All admin routes require authentication
router.use(verifyToken);

// ─── GET /api/admin/users ─── (ADMIN + MOD)
router.get('/users', isAdminOrMod, async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email', 'rol', 'fecha_creacion', 'current_streak', 'max_streak']
        });

        // Count habits per user
        const usersWithHabits = await Promise.all(users.map(async (u) => {
            const habitCount = await Habit.count({ where: { usuario_id: u.id } });
            return { ...u.toJSON(), habitCount };
        }));

        return sendSuccess(res, 200, 'Lista de usuarios', usersWithHabits);
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/admin/stats ─── (ADMIN + MOD)
router.get('/stats', isAdminOrMod, async (req, res, next) => {
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

// ─── GET /api/admin/registration-stats ─── (ADMIN + MOD)
// Returns user registration counts per day for the last 30 days
router.get('/registration-stats', isAdminOrMod, async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['fecha_creacion'],
            order: [['fecha_creacion', 'ASC']]
        });

        const stats = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setUTCHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const count = users.filter(u => {
                const uDate = new Date(u.fecha_creacion);
                return uDate.toISOString().split('T')[0] === dateStr;
            }).length;

            stats.push({ fecha: dateStr, registros: count });
        }

        return sendSuccess(res, 200, 'Estadísticas de registros', stats);
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/admin/users/:id/habits ─── (ADMIN + MOD)
// Deletes all habits and logs of a specific user
router.delete('/users/:id/habits', isAdminOrMod, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findByPk(userId);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        // Prevent deleting own data
        if (userId === req.user.id) {
            return sendError(res, 403, 'No puedes eliminar tus propios datos desde el panel.');
        }

        // Delete logs from MongoDB
        await Log.deleteMany({ usuario_id: userId });

        // Delete habits from MySQL (hooks will sync to Mongo)
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });

        return sendSuccess(res, 200, `Hábitos y registros del usuario ${user.nombre} eliminados.`);
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/admin/users/:id ─── (ADMIN + MOD)
// Deletes user account completely
router.delete('/users/:id', isAdminOrMod, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findByPk(userId);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        if (userId === req.user.id) {
            return sendError(res, 403, 'No puedes eliminar tu propia cuenta desde el panel.');
        }

        // Delete all related data
        await Log.deleteMany({ usuario_id: userId });
        await Achievement.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await UserMetric.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await user.destroy(); // hooks will sync to Mongo

        return sendSuccess(res, 200, `Cuenta de ${user.nombre} eliminada permanentemente.`);
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/admin/users/:id/role ─── (ADMIN ONLY)
// Changes a user's role
router.patch('/users/:id/role', isAdmin, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { rol } = req.body;

        if (![0, 1, 2].includes(rol)) {
            return sendError(res, 400, 'Rol inválido. Usa 0 (Admin), 1 (Usuario) o 2 (Moderador).');
        }

        const user = await User.findByPk(userId);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        if (userId === req.user.id) {
            return sendError(res, 403, 'No puedes cambiar tu propio rol.');
        }

        await user.update({ rol });

        return sendSuccess(res, 200, `Rol de ${user.nombre} actualizado.`, { id: user.id, rol: user.rol });
    } catch (error) {
        next(error);
    }
});

export default router;
