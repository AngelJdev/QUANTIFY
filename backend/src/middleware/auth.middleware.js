import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';
import { sendError } from '../utils/response.js';

export const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return sendError(res, 403, 'No token provided.');
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove Bearer
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
            return sendError(res, 401, 'Unauthorized! Invalid token.');
        }
        
        req.user = {
            id: decoded.id,
            rol: decoded.rol
        };
        next();
    });
};
