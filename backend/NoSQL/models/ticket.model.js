import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
