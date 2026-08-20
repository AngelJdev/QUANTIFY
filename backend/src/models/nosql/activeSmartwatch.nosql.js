import mongoose from 'mongoose';

const ActiveSmartwatchSchema = new mongoose.Schema({
    usuario_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    device_id: {
        type: String,
        required: true
    },
    linked_at: {
        type: Date,
        default: Date.now
    }
}, { collection: 'ActiveSmartwatches' });

const ActiveSmartwatch = mongoose.models.ActiveSmartwatch || mongoose.model('ActiveSmartwatch', ActiveSmartwatchSchema);

export default ActiveSmartwatch;
