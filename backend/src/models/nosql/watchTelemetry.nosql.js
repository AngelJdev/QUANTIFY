import mongoose from 'mongoose';

/**
 * Telemetry data from the QUANTIFY Smartwatch.
 * Compacted sensor readings (BPM, stress) buffered on the watch
 * and batch-synced via POST /api/smartwatch/sync.
 */
const WatchTelemetrySchema = new mongoose.Schema({
    usuario_id: {
        type: Number,
        required: true,
        index: true
    },
    device_id: {
        type: String,
        required: true
    },
    avg_bpm: {
        type: Number,
        default: null
    },
    max_bpm: {
        type: Number,
        default: null
    },
    min_bpm: {
        type: Number,
        default: null
    },
    avg_stress: {
        type: Number,
        default: null
    },
    sample_count: {
        type: Number,
        default: 0
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    synced_at: {
        type: Date,
        default: Date.now
    }
}, { collection: 'WatchTelemetry' });

WatchTelemetrySchema.index({ usuario_id: 1, start_time: -1 });

const WatchTelemetry = mongoose.model('WatchTelemetry', WatchTelemetrySchema);

export default WatchTelemetry;
