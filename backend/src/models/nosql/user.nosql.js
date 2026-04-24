import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    sql_id: { type: Number, required: true, index: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    rol: { type: Number, default: 1 },
    preferencias: { type: Object, default: null },
    avatar_url: { type: String, default: null },
    current_streak: { type: Number, default: 0 },
    max_streak: { type: Number, default: 0 },
    last_login_date: { type: Date, default: null },
    fecha_creacion: { type: Date, default: Date.now }
}, { collection: 'Users' });

export default mongoose.model('MongoUser', UserSchema);
