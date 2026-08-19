import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt.config.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getIO } from '../utils/socket.js';
import User from '../models/user.model.js';
import Log from '../models/log.model.js';
import WatchTelemetry from '../models/nosql/watchTelemetry.nosql.js';
import Habit from '../models/habit.model.js';
import SmartwatchPairing from '../models/nosql/smartwatchPairing.nosql.js';
import ActiveSmartwatch from '../models/nosql/activeSmartwatch.nosql.js';
import { analyzeAchievements } from '../services/gamificationEngine.js';

/**
 * POST /api/smartwatch/generate-code
 * Watch requests a pairing code to display on screen.
 * Body: { deviceId: "QWATCH-XXXX" }
 */
export const generatePairingCode = async (req, res, next) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return sendError(res, 400, 'deviceId is required');
        }

        // Remove any old pairing codes for this device
        await SmartwatchPairing.deleteMany({ device_id: deviceId });

        // Generate 6-char alphanumeric code
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        const pairing = await SmartwatchPairing.create({
            code,
            device_id: deviceId,
            authorized: false
        });

        return sendSuccess(res, 201, 'Código de vinculación generado', {
            code: pairing.code,
            deviceId: pairing.device_id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/smartwatch/verify-code
 * Web user enters the code to link their account with the watch.
 * Body: { code: "A1B2C3" }
 * Auth: Requires JWT (web user must be logged in)
 */
export const verifyPairingCode = async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return sendError(res, 400, 'El código es requerido');
        }

        const pairing = await SmartwatchPairing.findOne({ code: code.toUpperCase() });

        if (!pairing) {
            return sendError(res, 400, 'Código inválido o expirado');
        }

        // Get user data
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return sendError(res, 404, 'Usuario no encontrado');
        }

        // Generate a long-lived JWT for the watch
        const watchToken = jwt.sign(
            { id: user.id, rol: user.rol, device: pairing.device_id },
            jwtConfig.secret,
            { expiresIn: '365d' }
        );

        // Update pairing entry with authorization payload
        pairing.authorized = true;
        pairing.usuario_id = user.id;
        pairing.user_data = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            current_streak: user.current_streak || 0,
            max_streak: user.max_streak || 0
        };
        pairing.token = watchToken;
        await pairing.save();

        // Persist active link in database
        await ActiveSmartwatch.findOneAndUpdate(
            { usuario_id: user.id },
            { device_id: pairing.device_id, linked_at: new Date() },
            { upsert: true, new: true }
        );

        req.app.get('io')?.to(`user_${user.id}`).emit('smartwatch_linked', { userId: user.id, deviceId: pairing.device_id });

        return sendSuccess(res, 200, 'Dispositivo vinculado exitosamente', {
            deviceId: pairing.device_id,
            userName: user.nombre
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/smartwatch/poll-auth?deviceId=QWATCH-XXXX
 * Watch polls to check if user has authorized from the web.
 * No auth required (watch doesn't have a token yet).
 */
export const pollAuth = async (req, res, next) => {
    try {
        const { deviceId } = req.query;

        if (!deviceId) {
            return sendError(res, 400, 'deviceId query param is required');
        }

        const pairing = await SmartwatchPairing.findOne({ device_id: deviceId });

        if (!pairing || !pairing.authorized) {
            return sendSuccess(res, 200, 'Poll result', { authorized: false });
        }

        const result = {
            authorized: true,
            token: pairing.token,
            user: pairing.user_data
        };

        // Clean up the pairing record once successfully polled
        await SmartwatchPairing.deleteOne({ _id: pairing._id });

        return sendSuccess(res, 200, 'Poll result', result);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/smartwatch/sync
 * Batch sync of offline actions and telemetry from the watch.
 * Body: { actions: [...], telemetry: [...] }
 * Auth: Requires JWT (watch token)
 */
export const syncData = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Check if device is still actively linked
        const active = await ActiveSmartwatch.findOne({ usuario_id: userId });
        if (!active) {
            return sendError(res, 401, 'Dispositivo desvinculado por el usuario');
        }

        const { actions = [], telemetry = [] } = req.body;
        const errors = [];
        let processedActions = 0;
        let processedTelemetry = 0;

        // Process habit actions → create or update Logs in MongoDB
        for (const action of actions) {
            try {
                const actionDate = action.timestamp ? new Date(action.timestamp) : new Date();
                const startOfDay = new Date(actionDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(actionDate);
                endOfDay.setUTCHours(23, 59, 59, 999);

                let log = await Log.findOne({
                    habito_id: action.habitId,
                    usuario_id: userId,
                    fecha_registro: { $gte: startOfDay, $lte: endOfDay }
                });

                if (log) {
                    log.completado = action.completado;
                    if (action.valorRegistrado !== undefined && action.valorRegistrado !== null) {
                        log.valor_registrado = action.valorRegistrado;
                    }
                    log.notas = `[smartwatch] ${action.type}`;
                    await log.save();
                } else {
                    await Log.create({
                        habito_id: action.habitId,
                        usuario_id: userId,
                        fecha_registro: startOfDay,
                        completado: action.completado,
                        valor_registrado: action.valorRegistrado || null,
                        notas: `[smartwatch] ${action.type}`
                    });
                }

                // Trigger gamification engine
                if (action.completado) {
                    analyzeAchievements(userId, action.habitId, action.valorRegistrado || 1).catch(console.error);
                }

                processedActions++;
            } catch (err) {
                errors.push(`Action ${action.actionId}: ${err.message}`);
            }
        }

        // Process telemetry → store in WatchTelemetry collection
        for (const t of telemetry) {
            try {
                await WatchTelemetry.create({
                    usuario_id: userId,
                    device_id: req.user.device || 'unknown',
                    avg_bpm: t.avgBpm,
                    max_bpm: t.maxBpm,
                    min_bpm: t.minBpm,
                    avg_stress: t.avgStress,
                    sample_count: t.sampleCount,
                    start_time: new Date(t.startTime),
                    end_time: new Date(t.endTime)
                });
                processedTelemetry++;
            } catch (err) {
                errors.push(`Telemetry: ${err.message}`);
            }
        }

        // Trigger real-time updates on web via all available socket handles
        const ioInstance = getIO() || req.app.get('io');
        ioInstance?.to(`user_${userId}`).emit('habit_updated', { userId });
        ioInstance?.to(`user_${userId}`).emit('dashboard_updated', { userId });
        ioInstance?.emit('habit_updated', { userId });
        ioInstance?.emit('dashboard_updated', { userId });

        return sendSuccess(res, 200, 'Sincronización completada', {
            processedActions,
            processedTelemetry,
            errors
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/smartwatch/dashboard
 * Optimized single-call endpoint for the watch dashboard.
 * Returns habits + stats + streak in one response.
 * Auth: Requires JWT
 */
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // If requested by web (no device in token), check if user actually has a linked smartwatch
        if (!req.user.device) {
            const active = await ActiveSmartwatch.findOne({ usuario_id: userId });
            if (!active) {
                return sendSuccess(res, 200, 'No hay dispositivo vinculado', null);
            }
        } else {
            // If requested by watch, verify active link
            const active = await ActiveSmartwatch.findOne({ usuario_id: userId });
            if (!active) {
                return sendError(res, 401, 'Dispositivo desvinculado por el usuario');
            }
        }

        // Get user
        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'email', 'current_streak', 'max_streak']
        });

        if (!user) {
            return sendError(res, 404, 'Usuario no encontrado');
        }

        // Get active habits only belonging to this user
        const habits = await Habit.findAll({
            where: { usuario_id: userId, activo: true },
            order: [['nombre', 'ASC']]
        });

        // Get today's logs
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayLogs = await Log.find({
            usuario_id: userId,
            fecha_registro: { $gte: todayStart, $lte: todayEnd }
        });

        // Filter and deduplicate completed habit IDs that match active habits
        const activeHabitIds = new Set(habits.map(h => h.id));
        const completedHabitIdSet = new Set(
            todayLogs
                .filter(l => l.completado && activeHabitIds.has(l.habito_id))
                .map(l => l.habito_id)
        );

        // Build a map of habit_id -> latest valor_registrado from today's logs
        const habitValueMap = {};
        for (const log of todayLogs) {
            if (log.valor_registrado != null && activeHabitIds.has(log.habito_id)) {
                if (!habitValueMap[log.habito_id] || log.valor_registrado > habitValueMap[log.habito_id]) {
                    habitValueMap[log.habito_id] = log.valor_registrado;
                }
            }
        }

        const totalHabitsCount = habits.length;
        const completedTodayCount = completedHabitIdSet.size;

        return sendSuccess(res, 200, 'Dashboard del smartwatch', {
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                current_streak: user.current_streak,
                max_streak: user.max_streak
            },
            habits: habits.map(h => ({
                ...h.toJSON(),
                completado_hoy: completedHabitIdSet.has(h.id),
                valor_hoy: habitValueMap[h.id] || null
            })),
            stats: {
                totalHabits: totalHabitsCount,
                completedToday: completedTodayCount,
                completionPercent: totalHabitsCount > 0
                    ? Math.round((completedTodayCount / totalHabitsCount) * 100)
                    : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/smartwatch/unlink
 * Unlinks the smartwatch device for the authenticated user.
 * Auth: Requires JWT
 */
export const unlinkDevice = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await ActiveSmartwatch.deleteMany({ usuario_id: userId });
        req.app.get('io')?.to(`user_${userId}`).emit('smartwatch_unlinked', { userId });
        return sendSuccess(res, 200, 'Dispositivo desvinculado exitosamente');
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/smartwatch/unlink-from-watch
 * Called by the watch when user unlinks from the watch settings.
 * Marks the user as unlinked so the web dashboard reflects the change.
 * Auth: Requires JWT (watch token)
 */
export const unlinkFromWatch = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await ActiveSmartwatch.deleteMany({ usuario_id: userId });
        req.app.get('io')?.to(`user_${userId}`).emit('smartwatch_unlinked', { userId });
        return sendSuccess(res, 200, 'Dispositivo desvinculado desde el reloj');
    } catch (error) {
        next(error);
    }
};
