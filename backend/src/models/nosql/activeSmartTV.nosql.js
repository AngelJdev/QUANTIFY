import mongoose from 'mongoose';

const ActiveSmartTVSchema = new mongoose.Schema({
    usuario_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    device_name: {
        type: String,
        default: 'QUANTIFY Smart TV'
    },
    linked_at: {
        type: Date,
        default: Date.now
    }
}, { collection: 'ActiveSmartTVs' });

const ActiveSmartTV = mongoose.models.ActiveSmartTV
    || mongoose.model('ActiveSmartTV', ActiveSmartTVSchema);

export default ActiveSmartTV;
