import crypto from 'crypto';

/**
 * Pairing Service — manages smartwatch device linking codes.
 * 
 * In-memory store with TTL. For production, move to Redis.
 * 
 * Flow:
 * 1. Watch requests a code → generateCode(deviceId)
 * 2. User enters code on web → verifyCode(code) → returns deviceId
 * 3. Web authorizes the device → authorizeDevice(deviceId, userId, token)
 * 4. Watch polls → getAuthorization(deviceId) → returns { token, user }
 */

// In-memory store: { code: { deviceId, expiresAt } }
const pairingCodes = new Map();

// In-memory store: { deviceId: { authorized, token, user } }
const deviceAuth = new Map();

// TTL: 2 minutes for pairing codes
const CODE_TTL_MS = 2 * 60 * 1000;

/**
 * Generate a 6-character alphanumeric pairing code.
 * @param {string} deviceId - Unique watch device identifier
 * @returns {{ code: string, deviceId: string, expiresAt: string }}
 */
export const generateCode = (deviceId) => {
    // Remove any existing code for this device
    for (const [existingCode, data] of pairingCodes) {
        if (data.deviceId === deviceId) {
            pairingCodes.delete(existingCode);
        }
    }

    // Generate 6-char alphanumeric code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    pairingCodes.set(code, {
        deviceId,
        expiresAt
    });

    // Auto-cleanup expired codes
    setTimeout(() => {
        pairingCodes.delete(code);
    }, CODE_TTL_MS);

    return {
        code,
        deviceId,
        expiresAt: expiresAt.toISOString()
    };
};

/**
 * Verify a pairing code entered by the user on the web.
 * @param {string} code - The 6-char code
 * @returns {{ valid: boolean, deviceId?: string }}
 */
export const verifyCode = (code) => {
    const upperCode = code.toUpperCase();
    const entry = pairingCodes.get(upperCode);

    if (!entry) {
        return { valid: false };
    }

    if (new Date() > entry.expiresAt) {
        pairingCodes.delete(upperCode);
        return { valid: false };
    }

    return { valid: true, deviceId: entry.deviceId };
};

/**
 * Authorize a device (called after web user verifies the code).
 * @param {string} deviceId
 * @param {object} user - User data { id, nombre, email, current_streak, max_streak }
 * @param {string} token - JWT token for the watch
 */
const activeLinkedUsers = new Set();
const unlinkedUsers = new Set();

/**
 * Authorize a device (called after web user verifies the code).
 * @param {string} deviceId
 * @param {object} user - User data { id, nombre, email, current_streak, max_streak }
 * @param {string} token - JWT token for the watch
 */
export const authorizeDevice = (deviceId, user, token) => {
    activeLinkedUsers.add(user.id);
    unlinkedUsers.delete(user.id);

    deviceAuth.set(deviceId, {
        authorized: true,
        token,
        user
    });

    // Clean up the pairing code
    for (const [code, data] of pairingCodes) {
        if (data.deviceId === deviceId) {
            pairingCodes.delete(code);
            break;
        }
    }

    // Auto-cleanup after 5 minutes (watch should have polled by then)
    setTimeout(() => {
        deviceAuth.delete(deviceId);
    }, 5 * 60 * 1000);
};

/**
 * Check if a device has been authorized (watch polls this).
 * @param {string} deviceId
 * @returns {{ authorized: boolean, token?: string, user?: object }}
 */
export const getAuthorization = (deviceId) => {
    const entry = deviceAuth.get(deviceId);

    if (!entry || !entry.authorized) {
        return { authorized: false };
    }

    // Once polled successfully, clean up
    deviceAuth.delete(deviceId);

    return {
        authorized: true,
        token: entry.token,
        user: entry.user
    };
};

/**
 * Unlink all devices for a given user.
 * @param {number} userId
 */
export const unlinkDeviceForUser = (userId) => {
    activeLinkedUsers.delete(userId);
    unlinkedUsers.add(userId);
    for (const [deviceId, data] of deviceAuth.entries()) {
        if (data.user?.id === userId) {
            deviceAuth.delete(deviceId);
        }
    }
};

/**
 * Check if a user has an active smartwatch linked.
 * @param {number} userId
 */
export const isUserLinked = (userId) => {
    return activeLinkedUsers.has(userId) && !unlinkedUsers.has(userId);
};

/**
 * Check if a user's smartwatch session has been unlinked.
 * @param {number} userId
 */
export const isUserUnlinked = (userId) => {
    return unlinkedUsers.has(userId);
};

/**
 * Clear unlinked status when user pairs a new watch.
 * @param {number} userId
 */
export const clearUnlinkedUser = (userId) => {
    unlinkedUsers.delete(userId);
    activeLinkedUsers.add(userId);
};


