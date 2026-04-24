import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrMod } from '../middleware/role.middleware.js';
import User from '../models/user.model.js';
import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import UserMetric from '../models/userMetric.model.js';
import Achievement from '../models/achievement.model.js';
import UserEvent from '../models/nosql/userEvent.nosql.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getIO } from '../utils/socket.js';

const router = Router();

// All admin routes require authentication
router.use(verifyToken);

// ─── Helper: emit socket event to all admin clients ───
const emitAdminEvent = (event, data) => {
    const io = getIO();
    if (io) io.emit(event, data);
};

// ─── GET /api/admin/users/:id/habits ─── (ADMIN + MOD)
router.get('/users/:id/habits', isAdminOrMod, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const habits = await Habit.findAll({
            where: { usuario_id: userId },
            order: [['fecha_creacion', 'DESC']]
        });
        return sendSuccess(res, 200, 'Hábitos del usuario', habits);
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/admin/users ─── (ADMIN + MOD)
router.get('/users', isAdminOrMod, async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email', 'rol', 'fecha_creacion', 'current_streak', 'max_streak']
        });

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
        return sendSuccess(res, 200, 'Estadísticas del sistema', { totalUsers, totalHabits });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/admin/registration-stats ─── (ADMIN + MOD)
// Cumulative user count over the last 30 days (goes up on create, down on delete)
router.get('/registration-stats', isAdminOrMod, async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

        // Count users created before the 30-day window (base count)
        const { Op } = await import('sequelize');
        const baseCount = await User.count({
            where: { fecha_creacion: { [Op.lt]: thirtyDaysAgo } }
        });

        // Get all events in the last 30 days
        const events = await UserEvent.find({
            fecha: { $gte: thirtyDaysAgo }
        }).sort({ fecha: 1 });

        // Also get users created in the last 30 days (for registrations not yet tracked as events)
        const recentUsers = await User.findAll({
            where: { fecha_creacion: { [Op.gte]: thirtyDaysAgo } },
            attributes: ['fecha_creacion']
        });

        // Build daily stats
        const stats = [];
        let cumulative = baseCount;

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setUTCHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Count creates from events for this day
            const dayCreates = events.filter(e => {
                const eDate = new Date(e.fecha).toISOString().split('T')[0];
                return eDate === dateStr && e.type === 'CREATED';
            }).length;

            // Count deletes from events for this day
            const dayDeletes = events.filter(e => {
                const eDate = new Date(e.fecha).toISOString().split('T')[0];
                return eDate === dateStr && e.type === 'DELETED';
            }).length;

            // Fallback: count registrations from MySQL if no events exist for creates
            const dayRegistrations = recentUsers.filter(u => {
                return new Date(u.fecha_creacion).toISOString().split('T')[0] === dateStr;
            }).length;

            const netCreates = Math.max(dayCreates, dayRegistrations);
            cumulative += netCreates - dayDeletes;

            stats.push({ fecha: dateStr, total: cumulative, registros: netCreates, bajas: dayDeletes });
        }

        return sendSuccess(res, 200, 'Estadísticas de registros', stats);
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/admin/habits/:id ─── (ADMIN + MOD)
// Deletes a single habit by ID (admin override, ignores ownership)
router.delete('/habits/:id', isAdminOrMod, async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.id);
        const habit = await Habit.findByPk(habitId);
        if (!habit) return sendError(res, 404, 'Hábito no encontrado.');

        // Delete logs for this habit
        await Log.deleteMany({ habito_id: habit.id });
        await habit.destroy(); // hooks sync to Mongo

        emitAdminEvent('admin:data-changed', { type: 'HABIT_DELETED', habitId });
        return sendSuccess(res, 200, `Hábito "${habit.nombre}" eliminado.`);
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/admin/users/:id/habits ─── (ADMIN + MOD)
// Deletes ALL habits and logs of a specific user
router.delete('/users/:id/habits', isAdminOrMod, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findByPk(userId);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        if (userId === req.user.id) {
            return sendError(res, 403, 'No puedes eliminar tus propios datos desde el panel.');
        }

        await Log.deleteMany({ usuario_id: userId });
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });

        emitAdminEvent('admin:data-changed', { type: 'ALL_HABITS_DELETED', userId });
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

        // Moderators CANNOT delete admins
        if (req.user.rol === 2 && user.rol === 0) {
            return sendError(res, 403, 'Un moderador no puede eliminar a un administrador.');
        }

        // Delete all related data
        await Log.deleteMany({ usuario_id: userId });
        await Achievement.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await UserMetric.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await user.destroy(); // hooks sync to Mongo

        // Log deletion event for the chart
        await UserEvent.create({ type: 'DELETED', userId });

        emitAdminEvent('admin:data-changed', { type: 'USER_DELETED', userId });
        return sendSuccess(res, 200, `Cuenta de ${user.nombre} eliminada permanentemente.`);
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/admin/users/:id/role ─── (ADMIN ONLY)
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

        emitAdminEvent('admin:data-changed', { type: 'ROLE_CHANGED', userId, newRole: rol });
        return sendSuccess(res, 200, `Rol de ${user.nombre} actualizado.`, { id: user.id, rol: user.rol });
    } catch (error) {
        next(error);
    }
});

export default router;
