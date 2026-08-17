import api from './api';

/**
 * Smartwatch Service — API calls for device pairing management.
 * Endpoints defined in: backend/API/routes/smartwatch.routes.js
 */

/**
 * Verify a pairing code entered by the user.
 * Links the user's account with the smartwatch device.
 * @param {string} code - 6-character alphanumeric code from the watch
 */
export const verifyPairingCode = async (code) => {
    const response = await api.post('/smartwatch/verify-code', { code });
    return response.data;
};

/**
 * Get the user's linked devices (future enhancement).
 * For now returns the dashboard data if a watch is linked.
 */
export const getSmartwatchDashboard = async () => {
    const response = await api.get('/smartwatch/dashboard');
    return response.data;
};

/**
 * Unlink smartwatch device from the user's account.
 */
export const unlinkSmartwatch = async () => {
    const response = await api.post('/smartwatch/unlink');
    return response.data;
};

