import mongoose from 'mongoose';

const SmartTVPairingSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
        unique: true,
        index: true
    },
    device_name: {
        type: String,
        default: 'QUANTIFY Smart TV'
    },
    usuario_id: {
        type: Number,
        index: true,
        default: null
    },
    user_data: {
        type: Object,
        default: null
    },
    token: {
        type: String,
        default: null
    },
    authorized: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 300
    }
}, { collection: 'SmartTVPairings' });

const SmartTVPairing = mongoose.models.SmartTVPairing
    || mongoose.model('SmartTVPairing', SmartTVPairingSchema);

export default SmartTVPairing;
