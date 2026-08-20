import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { analyzeAchievements } from '../services/gamificationEngine.js';

/**
 * Controlador para la gestión de tickets de soporte técnico
 */
export const createTicket = async (req, res, next) => {
    try {
        const { asunto, email, mensaje, prioridad } = req.body;

        if (!asunto || !mensaje) {
            return sendError(res, 400, 'El asunto y el mensaje son requeridos');
        }

        const ticketId = `QTY-${Math.floor(100000 + Math.random() * 900000)}`;

        if (req.user && req.user.id) {
            const user = await User.findByPk(req.user.id);
            if (user) {
                const prefs = user.preferencias || {};
                prefs.has_contacted_support = true;
                user.preferencias = prefs;
                await user.changed('preferencias', true);
                await user.save();

                // Disparar motor de logros para comunidad_activa
                analyzeAchievements(user.id, null, 1).catch(console.error);
            }
        }

        return sendSuccess(res, 201, 'Ticket creado exitosamente.', {
            ticketId,
            asunto,
            status: 'Abierto'
        });
    } catch (error) {
        next(error);
    }
};
