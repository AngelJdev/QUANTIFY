import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
    sql_id: { type: Number, required: true, index: true, unique: true },
    usuario_id: { type: Number, required: true, index: true },
    titulo: { type: String, required: true },
    descripcion: { type: String, default: null },
    mes_logro: { type: String, default: null },
    icono_url: { type: String, default: null },
    fecha_obtencion: { type: Date, default: Date.now }
}, { collection: 'Achievements' });

export default mongoose.model('MongoAchievement', AchievementSchema);
