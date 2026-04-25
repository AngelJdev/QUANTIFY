import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrMod } from '../middleware/role.middleware.js';
import User from '../../SQL/models/user.model.js';
import Habit from '../../SQL/models/habit.model.js';
import Log from '../../NoSQL/models/log.nosql.js';
import UserMetric from '../../SQL/models/userMetric.model.js';
import Achievement from '../../SQL/models/achievement.model.js';
import UserEvent from '../../NoSQL/models/userEvent.nosql.js';
import BitacoraAdmin from '../../NoSQL/models/bitacoraAdmin.nosql.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const ROL_LABELS = { 0: 'ADMIN', 1: 'USUARIO', 2: 'MODERADOR' };

// Helper to get client IP
const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '0.0.0.0';

const router = Router();

// All admin routes require authentication
router.use(verifyToken);

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

// ─── GET /api/admin/users ─── (ADMIN + MOD) — Paginated with search
router.get('/users', isAdminOrMod, async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const search = (req.query.search || '').trim();
        const offset = (page - 1) * limit;

        // Build WHERE clause for search
        const { Op } = await import('sequelize');
        const whereClause = search ? {
            [Op.or]: [
                { nombre: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const { count: totalUsers, rows: users } = await User.findAndCountAll({
            attributes: ['id', 'nombre', 'username', 'email', 'rol', 'fecha_creacion', 'current_streak', 'max_streak'],
            where: whereClause,
            order: [['id', 'ASC']],
            limit,
            offset
        });

        const usersWithHabits = await Promise.all(users.map(async (u) => {
            const habitCount = await Habit.count({ where: { usuario_id: u.id } });
            return { ...u.toJSON(), habitCount };
        }));

        return sendSuccess(res, 200, 'Lista de usuarios', {
            users: usersWithHabits,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
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
        // Current accurate total
        const currentTotal = await User.count();

        // Get all events in the last 30 days (CREATED + DELETED)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const events = await UserEvent.find({
            fecha: { $gte: thirtyDaysAgo }
        });

        // Also get MySQL registration dates as fallback for CREATED events
        const { Op } = await import('sequelize');
        const recentUsers = await User.findAll({
            where: { fecha_creacion: { [Op.gte]: thirtyDaysAgo } },
            attributes: ['fecha_creacion'],
            raw: true
        });

        // Helper: format date as YYYY-MM-DD in local timezone
        const toDateStr = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Pre-compute creates and deletes per day
        const dailyCreates = {};
        const dailyDeletes = {};

        // From events
        events.forEach(e => {
            const ds = toDateStr(new Date(e.fecha));
            if (e.type === 'CREATED') dailyCreates[ds] = (dailyCreates[ds] || 0) + 1;
            if (e.type === 'DELETED') dailyDeletes[ds] = (dailyDeletes[ds] || 0) + 1;
        });

        // From MySQL registrations (fallback: use whichever is higher)
        recentUsers.forEach(u => {
            const ds = toDateStr(new Date(u.fecha_creacion));
            const mysqlCount = (dailyCreates[`mysql_${ds}`] || 0) + 1;
            dailyCreates[`mysql_${ds}`] = mysqlCount;
        });

        // Build backwards from today
        const dailyData = [];
        let total = currentTotal;

        for (let i = 0; i <= 29; i++) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const dateStr = toDateStr(d);

            dailyData.push({ fecha: dateStr, total: Math.max(0, total) });

            if (i < 29) {
                // Undo this day's changes to find previous day's total
                const creates = Math.max(dailyCreates[dateStr] || 0, dailyCreates[`mysql_${dateStr}`] || 0);
                const deletes = dailyDeletes[dateStr] || 0;
                total = total - creates + deletes;
            }
        }

        // Reverse to chronological order
        dailyData.reverse();

        return sendSuccess(res, 200, 'Estadísticas de registros', dailyData);
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

        // Log to bitacora_Admins
        const adminUser = await User.findByPk(req.user.id);
        await BitacoraAdmin.create({
            admin_id: req.user.id,
            admin_nombre: adminUser?.nombre || 'Desconocido',
            admin_username: adminUser?.username || 'unknown',
            admin_rol: ROL_LABELS[req.user.rol] || 'MODERADOR',
            accion: 'DELETE_HABIT',
            descripcion: `Eliminó el hábito "${habit.nombre}" (ID: ${habitId}) del usuario ID: ${habit.usuario_id}`,
            target_user_id: habit.usuario_id,
            target_user_nombre: null,
            ip: getClientIp(req)
        });

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
        const habitCount = await Habit.count({ where: { usuario_id: userId } });
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });

        // Log to bitacora_Admins
        const adminUser = await User.findByPk(req.user.id);
        await BitacoraAdmin.create({
            admin_id: req.user.id,
            admin_nombre: adminUser?.nombre || 'Desconocido',
            admin_username: adminUser?.username || 'unknown',
            admin_rol: ROL_LABELS[req.user.rol] || 'MODERADOR',
            accion: 'DELETE_ALL_HABITS',
            descripcion: `Eliminó TODOS los hábitos (${habitCount}) y registros del usuario "${user.nombre}" (ID: ${userId})`,
            target_user_id: userId,
            target_user_nombre: user.nombre,
            ip: getClientIp(req)
        });

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

        // Save user info before deletion
        const userName = user.nombre;
        const userEmail = user.email;

        // Delete all related data
        await Log.deleteMany({ usuario_id: userId });
        await Achievement.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await Habit.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await UserMetric.destroy({ where: { usuario_id: userId }, individualHooks: true });
        await user.destroy(); // hooks sync to Mongo

        // Log deletion event for the chart
        await UserEvent.create({ type: 'DELETED', userId });

        // Log to bitacora_Admins
        const adminUser = await User.findByPk(req.user.id);
        await BitacoraAdmin.create({
            admin_id: req.user.id,
            admin_nombre: adminUser?.nombre || 'Desconocido',
            admin_username: adminUser?.username || 'unknown',
            admin_rol: ROL_LABELS[req.user.rol] || 'MODERADOR',
            accion: 'DELETE_USER',
            descripcion: `Eliminó permanentemente la cuenta de "${userName}" (ID: ${userId}, Email: ${userEmail})`,
            target_user_id: userId,
            target_user_nombre: userName,
            ip: getClientIp(req)
        });

        return sendSuccess(res, 200, `Cuenta de ${userName} eliminada permanentemente.`);
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

        const oldRol = user.rol;
        await user.update({ rol });

        // Log to bitacora_Admins
        const adminUser = await User.findByPk(req.user.id);
        await BitacoraAdmin.create({
            admin_id: req.user.id,
            admin_nombre: adminUser?.nombre || 'Desconocido',
            admin_username: adminUser?.username || 'unknown',
            admin_rol: ROL_LABELS[req.user.rol] || 'ADMIN',
            accion: 'ROLE_CHANGE',
            descripcion: `Cambió el rol de "${user.nombre}" (ID: ${userId}) de ${ROL_LABELS[oldRol]} a ${ROL_LABELS[rol]}`,
            target_user_id: userId,
            target_user_nombre: user.nombre,
            ip: getClientIp(req)
        });

        return sendSuccess(res, 200, `Rol de ${user.nombre} actualizado.`, { id: user.id, rol: user.rol });
    } catch (error) {
        next(error);
    }
});

export default router;
