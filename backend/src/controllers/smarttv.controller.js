import Habit from '../models/habit.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getIO } from '../utils/socket.js';
import { jwtConfig } from '../config/jwt.config.js';
import SmartTVPairing from '../models/nosql/smartTVPairing.nosql.js';
import ActiveSmartTV from '../models/nosql/activeSmartTV.nosql.js';

const PAIRING_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generatePairingCode = () => Array.from(
    { length: 6 },
    () => PAIRING_CHARACTERS[crypto.randomInt(PAIRING_CHARACTERS.length)]
).join('');

const pairingExpired = (pairing) => (
    !pairing?.created_at || Date.now() - new Date(pairing.created_at).getTime() > 5 * 60 * 1000
);

/**
 * Genera un código de 6 caracteres para vinculación en Smart TV
 * Public route (llamado por la app de Smart TV)
 */
export const requestPairingCode = async (req, res) => {
    try {
        let pairing = null;

        for (let attempt = 0; attempt < 5 && !pairing; attempt += 1) {
            const code = generatePairingCode();
            const exists = await SmartTVPairing.exists({ code });
            if (!exists) {
                pairing = await SmartTVPairing.create({
                    code,
                    device_name: req.body?.device_name || 'QUANTIFY Smart TV'
                });
            }
        }

        if (!pairing) {
            return res.status(503).json({
                success: false,
                message: 'No fue posible generar un código. Intenta nuevamente.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                code: pairing.code,
                expires_in: 300
            }
        });
    } catch (error) {
        console.error('Error al generar código de Smart TV:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el código de vinculación de Smart TV'
        });
    }
};

/**
 * Consulta el estado de vinculación del código (polling por la Smart TV)
 * Public route (llamado por la app de Smart TV)
 */
export const checkPairingStatus = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Código es requerido' });
        }

        const pairing = await SmartTVPairing.findOne({ code: code.trim().toUpperCase() });
        if (!pairing || pairingExpired(pairing)) {
            if (pairing) await SmartTVPairing.deleteOne({ _id: pairing._id });
            return res.status(404).json({
                success: false,
                message: 'Código inválido o expirado'
            });
        }

        if (pairing.authorized) {
            const responseData = {
                status: 'linked',
                token: pairing.token,
                user: pairing.user_data
            };
            await SmartTVPairing.deleteOne({ _id: pairing._id });
            return res.status(200).json({
                success: true,
                data: responseData
            });
        }

        res.status(200).json({
            success: true,
            data: {
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error al verificar estado de Smart TV:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el estado de vinculación'
        });
    }
};

/**
 * Verifica e ingresa el código desde la App Web (Autenticado)
 * Private route
 */
export const verifyPairingCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code || code.trim().length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'El código debe ser de 6 caracteres'
            });
        }

        const formattedCode = code.trim().toUpperCase();
        const pairing = await SmartTVPairing.findOne({ code: formattedCode });

        if (!pairing || pairingExpired(pairing)) {
            if (pairing) await SmartTVPairing.deleteOne({ _id: pairing._id });
            return res.status(404).json({
                success: false,
                message: 'Código inválido o expirado. Genera uno nuevo en tu Smart TV.'
            });
        }

        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'email', 'avatar_url', 'is_premium', 'rol']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Generar un token JWT para la Smart TV (duración extendida a 30 días)
        const tvToken = jwt.sign(
            { id: user.id, rol: user.rol, device: 'smarttv' },
            jwtConfig.secret,
            { expiresIn: '30d' }
        );

        const userDetails = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            avatar: user.avatar_url,
            is_premium: user.is_premium
        };

        pairing.authorized = true;
        pairing.usuario_id = user.id;
        pairing.token = tvToken;
        pairing.user_data = userDetails;
        await pairing.save();

        await ActiveSmartTV.findOneAndUpdate(
            { usuario_id: user.id },
            {
                device_name: pairing.device_name || 'QUANTIFY Smart TV',
                linked_at: new Date()
            },
            { upsert: true, new: true }
        );

        // Notificar por websockets a la sala del usuario
        const io = getIO();
        if (io) {
            io.to(`user_${userId}`).emit('smarttv_linked', {
                deviceName: 'QUANTIFY Smart TV'
            });
        }

        res.status(200).json({
            success: true,
            is_linked: true,
            message: '¡Smart TV vinculada exitosamente con tu cuenta!',
            data: {
                deviceName: 'QUANTIFY Smart TV',
                user: userDetails
            }
        });
    } catch (error) {
        console.error('Error al vincular Smart TV desde web:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al procesar la vinculación de Smart TV'
        });
    }
};

/**
 * Obtiene las métricas y datos del Dashboard para la Smart TV (Autenticado o con Token de TV)
 */
export const getSmartTVDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const activeDevice = await ActiveSmartTV.findOne({ usuario_id: userId });
        const isLinked = Boolean(activeDevice);
        if (!isLinked) {
            return res.status(200).json({
                success: true,
                is_linked: false,
                data: null
            });
        }

        const habits = await Habit.findAll({
            where: { usuario_id: userId, activo: true },
            order: [['fecha_creacion', 'DESC']]
        });

        // Calcular estadísticas
        const totalHabits = habits.length;
        const completedToday = habits.filter(h => h.completado_hoy).length;
        const completionPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        res.status(200).json({
            success: true,
            is_linked: true,
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    avatar: user.avatar_url,
                    current_streak: user.current_streak || 0,
                    max_streak: user.max_streak || 0,
                    is_premium: user.is_premium
                },
                stats: {
                    totalHabits,
                    completedToday,
                    completionPercent
                },
                habits: habits.map(h => ({
                    id: h.id,
                    nombre: h.nombre,
                    categoria: h.categoria,
                    completado_hoy: h.completado_hoy,
                    frecuencia: h.frecuencia,
                    racha_actual: h.racha_actual || 0,
                    meta_diaria: h.meta_diaria,
                    unidad: h.unidad
                }))
            }
        });
    } catch (error) {
        console.error('Error al obtener dashboard de Smart TV:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos del dashboard de Smart TV'
        });
    }
};

/**
 * Desvincula la Smart TV (Autenticado)
 */
export const unlinkSmartTV = async (req, res) => {
    try {
        const userId = req.user.id;
        await ActiveSmartTV.deleteOne({ usuario_id: userId });
        await SmartTVPairing.deleteMany({ usuario_id: userId });

        const io = getIO();
        if (io) {
            io.to(`user_${userId}`).emit('smarttv_unlinked');
        }

        res.status(200).json({
            success: true,
            message: 'Smart TV desvinculada exitosamente'
        });
    } catch (error) {
        console.error('Error al desvincular Smart TV:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desvincular Smart TV'
        });
    }
};
