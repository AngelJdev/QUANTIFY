import Ticket from '../../NoSQL/models/ticket.model.js';
import { sendSupportConfirmation } from '../services/email.service.js';

/**
 * Controlador para la gestión de tickets de soporte
 */
export const createTicket = async (req, res) => {
    try {
        const { asunto, email, mensaje, prioridad } = req.body;

        // 1. Generar ID único para el ticket
        const ticketId = `QTY-${Math.floor(100000 + Math.random() * 900000)}`;

        // 2. Guardar en MongoDB para persistencia histórica
        const newTicket = new Ticket({
            ticketId,
            asunto,
            email,
            mensaje,
            prioridad
        });
        await newTicket.save();

        // 3. Enviar correo de confirmación vía Mailtrap (asíncrono)
        sendSupportConfirmation({
            email,
            asunto,
            ticketId,
            prioridad
        }).catch(err => console.error('Error al enviar correo de soporte:', err));

        console.log(`[Support] Ticket ${ticketId} creado exitosamente para ${email}`);

        return res.status(201).json({
            status: 'success',
            message: 'Ticket creado exitosamente. Se ha enviado un correo de confirmación.',
            data: {
                ticketId,
                asunto,
                status: 'Abierto'
            }
        });
    } catch (error) {
        console.error('Error al crear ticket:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar su solicitud.'
        });
    }
};
