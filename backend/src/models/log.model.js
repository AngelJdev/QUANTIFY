import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    habito_id: {
        type: Number,
        required: true,
        index: true
    },
    usuario_id: {
        type: Number,
        required: true,
        index: true
    },
    fecha_registro: {
        type: Date,
        required: true
    },
    completado: {
        type: Boolean,
        default: false
    },
    valor_registrado: {
        type: Number,
        default: null
    },
    notas: {
        type: String,
        default: null
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

// Indexes to speed up queries for adherence and general lookup
LogSchema.index({ habito_id: 1, fecha_registro: -1 });

const Log = mongoose.model('Log', LogSchema);

export default Log;
