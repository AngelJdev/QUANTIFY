/**
 * Controlador para la gestión de tickets de soporte
 */
export const createTicket = async (req, res) => {
    try {
        // En un entorno real, aquí guardaríamos el ticket en la base de datos (MongoDB/Sequelize)
        const { asunto, email, mensaje, prioridad } = req.body;

        // Simulamos procesamiento asíncrono
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[Support] Nuevo ticket recibido de ${email}: ${asunto}`);

        return res.status(201).json({
            status: 'success',
            message: 'Ticket creado exitosamente. Nuestro equipo se pondrá en contacto pronto.',
            data: {
                ticketId: Math.floor(Math.random() * 1000000),
                asunto,
                prioridad
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
