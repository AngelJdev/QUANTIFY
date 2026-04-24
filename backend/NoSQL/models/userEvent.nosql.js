import mongoose from 'mongoose';

const UserEventSchema = new mongoose.Schema({
    type: { type: String, enum: ['CREATED', 'DELETED'], required: true },
    userId: { type: Number },
    fecha: { type: Date, default: Date.now }
}, { collection: 'UserEvents' });

export default mongoose.model('UserEvent', UserEventSchema);
