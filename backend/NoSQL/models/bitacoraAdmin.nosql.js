import mongoose from 'mongoose';

const BitacoraAdminSchema = new mongoose.Schema({
    admin_id: { type: Number, required: true, index: true },
    admin_nombre: { type: String, required: true },
    admin_username: { type: String, required: true },
    admin_rol: { type: String, enum: ['ADMIN', 'MODERADOR'], required: true },
    accion: {
        type: String,
        enum: ['DELETE_USER', 'DELETE_HABIT', 'DELETE_ALL_HABITS', 'ROLE_CHANGE'],
        required: true
    },
    descripcion: { type: String, required: true },
    target_user_id: { type: Number, default: null },
    target_user_nombre: { type: String, default: null },
    ip: { type: String, default: '0.0.0.0' },
    fecha: { type: Date, default: Date.now }
}, { collection: 'bitacora_Admins' });

// Index for fast queries by date and action type
BitacoraAdminSchema.index({ fecha: -1 });
BitacoraAdminSchema.index({ accion: 1, fecha: -1 });

export default mongoose.model('BitacoraAdmin', BitacoraAdminSchema);
