import { sendError } from '../utils/response.js';

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'ADMIN') {
        return sendError(res, 403, 'Require Admin Role.');
    }
    next();
};

export const isUserOrAdmin = (req, res, next) => {
    if (!req.user) {
        return sendError(res, 401, 'Unauthorized.');
    }
    next(); // Valid user object from auth.middleware is enough
};
