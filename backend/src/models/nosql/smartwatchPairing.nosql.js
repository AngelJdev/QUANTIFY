import mongoose from 'mongoose';

const SmartwatchPairingSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        index: true
    },
    device_id: {
        type: String,
        required: true,
        index: true
    },
    usuario_id: {
        type: Number,
        index: true
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
        expires: 300 // TTL: auto-delete after 5 minutes
    }
}, { collection: 'SmartwatchPairings' });

const SmartwatchPairing = mongoose.models.SmartwatchPairing || mongoose.model('SmartwatchPairing', SmartwatchPairingSchema);

export default SmartwatchPairing;
