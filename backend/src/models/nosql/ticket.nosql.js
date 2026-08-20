import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    usuario_id: {
        type: Number,
        required: true,
        index: true
    },
    asunto: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    mensaje: {
        type: String,
        required: true
    },
    prioridad: {
        type: String,
        enum: ['Baja', 'Media', 'Alta', 'Urgente'],
        default: 'Media'
    },
    status: {
        type: String,
        enum: ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado'],
        default: 'Abierto'
    },
    respuesta_admin: {
        type: String,
        default: null
    },
    respondido_por: {
        type: String,
        default: null
    },
    fecha_respuesta: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'Tickets'
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export default Ticket;
