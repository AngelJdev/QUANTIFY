import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
    sql_id: { type: Number, required: true, index: true, unique: true },
    usuario_id: { type: Number, required: true, index: true },
    nombre: { type: String, required: true },
    descripcion: { type: String, default: null },
    tipo_medicion: { type: String, default: 'BOOLEANO' },
    meta_diaria: { type: Number, default: null },
    unidad: { type: String, default: null },
    frecuencia: { type: String, default: 'DIARIO' },
    fecha_fin: { type: Date, default: null },
    duracion_tipo: { type: String, default: null },
    activo: { type: Boolean, default: true },
    fecha_creacion: { type: Date, default: Date.now }
}, { collection: 'Habits' });

export default mongoose.model('MongoHabit', HabitSchema);
