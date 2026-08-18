import Habit from '../models/habit.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { getIO } from '../utils/socket.js';

// Almacenamiento en memoria para códigos de vinculación de Smart TV
// Estructura: Map<code, { createdAt, status: 'pending'|'linked', userId, token, userDetails }>
const pendingTVCodes = new Map();

// Limpiar códigos expirados cada 2 minutos (códigos duran 5 minutos)
setInterval(() => {
    const now = Date.now();
    for (const [code, data] of pendingTVCodes.entries()) {
        if (now - data.createdAt > 5 * 60 * 1000) {
            pendingTVCodes.delete(code);
        }
    }
}, 2 * 60 * 1000);

/**
 * Genera un código de 6 caracteres para vinculación en Smart TV
 * Public route (llamado por la app de Smart TV)
 */
export const requestPairingCode = async (req, res) => {
    try {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        pendingTVCodes.set(code, {
            code,
            createdAt: Date.now(),
            status: 'pending',
            userId: null,
            token: null,
            userDetails: null
        });

        res.status(200).json({
            success: true,
            data: {
                code,
                expires_in: 300 // 5 minutos
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

        const data = pendingTVCodes.get(code.toUpperCase());
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Código inválido o expirado'
            });
        }

        if (data.status === 'linked') {
            // Eliminar el código del mapa una vez entregado
            pendingTVCodes.delete(code.toUpperCase());
            return res.status(200).json({
                success: true,
                status: 'linked',
                token: data.token,
                user: data.userDetails
            });
        }

        res.status(200).json({
            success: true,
            status: 'pending'
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
        const data = pendingTVCodes.get(formattedCode);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Código inválido o expirado. Genera uno nuevo en tu Smart TV.'
            });
        }

        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'email', 'avatar', 'is_premium', 'rol']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Generar un token JWT para la Smart TV (duración extendida a 30 días)
        const tvToken = jwt.sign(
            { id: user.id, rol: user.rol, device: 'smarttv' },
            process.env.JWT_SECRET || 'secret_quantify_key_2026',
            { expiresIn: '30d' }
        );

        // Actualizar el estado en memoria para que la TV lo reciba en la siguiente petición de polling
        data.status = 'linked';
        data.userId = user.id;
        data.token = tvToken;
        data.userDetails = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            avatar: user.avatar,
            is_premium: user.is_premium
        };

        // Notificar por websockets a la sala del usuario
        const io = getIO();
        if (io) {
            io.to(`user_${userId}`).emit('smarttv_linked', {
                deviceName: 'QUANTIFY Smart TV'
            });
        }

        res.status(200).json({
            success: true,
            message: '¡Smart TV vinculada exitosamente con tu cuenta!',
            data: {
                deviceName: 'QUANTIFY Smart TV',
                user: data.userDetails
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
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    avatar: user.avatar,
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
