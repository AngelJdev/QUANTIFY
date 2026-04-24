import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config.js';
import { sendError } from '../../utils/response.js';
import User from '../../SQL/models/user.model.js';

export const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return sendError(res, 403, 'No token provided.');
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove Bearer
    }

    jwt.verify(token, jwtConfig.secret, async (err, decoded) => {
        if (err) {
            return sendError(res, 401, 'Unauthorized! Invalid token.');
        }

        try {
            // Always fetch the current role from the DB so role changes take effect immediately
            const user = await User.findByPk(decoded.id, { attributes: ['id', 'rol'] });
            if (!user) {
                return sendError(res, 401, 'User not found.');
            }
            req.user = {
                id: user.id,
                rol: user.rol
            };
            next();
        } catch (dbError) {
            // Fallback to token role if DB is unreachable
            req.user = {
                id: decoded.id,
                rol: decoded.rol
            };
            next();
        }
    });
};
