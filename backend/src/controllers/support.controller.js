import Ticket from '../models/nosql/ticket.nosql.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { analyzeAchievements } from '../services/gamificationEngine.js';
import { getIO } from '../utils/socket.js';

/**
 * POST /api/support
 * Crear un nuevo ticket de soporte técnico
 */
export const createTicket = async (req, res, next) => {
    try {
        const { asunto, email, mensaje, prioridad = 'Media' } = req.body;

        if (!asunto || !mensaje) {
            return sendError(res, 400, 'El asunto y el mensaje son requeridos');
        }

        const userEmail = email || req.user?.email || 'usuario@quantify.ai';
        const ticketId = `QTY-${Math.floor(100000 + Math.random() * 900000)}`;

        const newTicket = await Ticket.create({
            ticketId,
            usuario_id: req.user.id,
            asunto: asunto.trim(),
            email: userEmail.toLowerCase().trim(),
            mensaje: mensaje.trim(),
            prioridad,
            status: 'Abierto'
        });

        // Actualizar preferencia para el logro Comunidad Activa
        if (req.user && req.user.id) {
            const user = await User.findByPk(req.user.id);
            if (user) {
                const prefs = user.preferencias || {};
                prefs.has_contacted_support = true;
                user.preferencias = prefs;
                await user.changed('preferencias', true);
                await user.save();

                analyzeAchievements(user.id, null, 1).catch(console.error);
            }
        }

        // Notificar por WebSockets en tiempo real a administradores
        const io = getIO();
        if (io) {
            io.emit('support:ticket-created', newTicket);
            io.to(`user_${req.user.id}`).emit('support:ticket-created', newTicket);
        }

        return sendSuccess(res, 201, 'Ticket de soporte creado exitosamente.', {
            ticket: newTicket
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/support/my-tickets
 * Obtener los tickets creados por el usuario autenticado
 */
export const getMyTickets = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        const tickets = await Ticket.find({ usuario_id }).sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Historial de tickets recuperado.', {
            tickets,
            total: tickets.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/support/admin/tickets
 * Obtener todos los tickets de soporte (Solo Admins / Moderadores)
 */
export const getAdminTickets = async (req, res, next) => {
    try {
        if (req.user.rol !== 0 && req.user.rol !== 2) {
            return sendError(res, 403, 'Acceso denegado. Se requieren permisos de administrador.');
        }

        const { status, search } = req.query;
        const filter = {};

        if (status && status !== 'TODOS') {
            filter.status = status;
        }

        if (search) {
            const q = search.trim();
            filter.$or = [
                { ticketId: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { asunto: { $regex: q, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(filter).sort({ createdAt: -1 });

        // Conteo general por estado
        const counts = {
            total: await Ticket.countDocuments(),
            abiertos: await Ticket.countDocuments({ status: 'Abierto' }),
            enProceso: await Ticket.countDocuments({ status: 'En Proceso' }),
            resueltos: await Ticket.countDocuments({ status: 'Resuelto' }),
            cerrados: await Ticket.countDocuments({ status: 'Cerrado' })
        };

        return sendSuccess(res, 200, 'Lista de tickets de soporte.', {
            tickets,
            counts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/support/admin/tickets/:ticketId
 * Responder ticket y actualizar su estado (Solo Admins / Moderadores)
 */
export const replyAdminTicket = async (req, res, next) => {
    try {
        if (req.user.rol !== 0 && req.user.rol !== 2) {
            return sendError(res, 403, 'Acceso denegado. Se requieren permisos de administrador.');
        }

        const { ticketId } = req.params;
        const { respuesta_admin, status } = req.body;

        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            return sendError(res, 404, 'Ticket no encontrado.');
        }

        if (respuesta_admin) {
            ticket.respuesta_admin = respuesta_admin.trim();
            ticket.respondido_por = req.user.nombre || (req.user.rol === 0 ? 'Administrador' : 'Moderador');
            ticket.fecha_respuesta = new Date();
        }

        if (status) {
            ticket.status = status;
        }

        await ticket.save();

        // Emitir actualizaciones por sockets
        const io = getIO();
        if (io) {
            io.emit('support:ticket-updated', ticket);
            io.to(`user_${ticket.usuario_id}`).emit('support:ticket-updated', ticket);
        }

        return sendSuccess(res, 200, 'Ticket actualizado correctamente.', {
            ticket
        });
    } catch (error) {
        next(error);
    }
};
