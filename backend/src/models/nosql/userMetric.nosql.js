import mongoose from 'mongoose';

const UserMetricSchema = new mongoose.Schema({
    sql_id: { type: Number, required: true, index: true, unique: true },
    usuario_id: { type: Number, required: true, index: true },
    edad: { type: Number, required: true },
    peso: { type: Number, required: true },
    estatura: { type: Number, required: true },
    genero: { type: String, required: true },
    nivel_actividad: { type: String, required: true },
    fecha_creacion: { type: Date, default: Date.now }
}, { collection: 'UserMetrics' });

export default mongoose.model('MongoUserMetric', UserMetricSchema);
