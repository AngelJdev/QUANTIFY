import mongoose from 'mongoose';

const BitacoraSchema = new mongoose.Schema({
    sql_id: { type: Number, index: true },
    operacion: { type: String, enum: ['INSERT', 'DELETE'], required: true },
    ip: { type: String, required: true },
    descripcion: { type: String, required: true },
    fecha_hora: { type: Date, default: Date.now }
}, { collection: 'Bitacora' });

export default mongoose.model('MongoBitacora', BitacoraSchema);
