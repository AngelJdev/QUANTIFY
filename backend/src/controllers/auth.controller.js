import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { jwtConfig } from '../config/jwt.config.js';
import { sendSuccess, sendError } from '../utils/response.js';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, rol: user.rol }, 
        jwtConfig.secret, 
        { expiresIn: jwtConfig.expiresIn }
    );
};

export const register = async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return sendError(res, 400, 'El correo electrónico ya está en uso');
        }

        const newUser = await User.create({
            nombre,
            email,
            password_hash: password // Se hashea en el Hook beforeCreate
        });

        const token = generateToken(newUser);

        return sendSuccess(res, 201, 'Usuario registrado exitosamente', {
            user: newUser.toJSON(),
            token
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendError(res, 401, 'Credenciales inválidas');
        }

        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            return sendError(res, 401, 'Credenciales inválidas');
        }

        const token = generateToken(user);

        return sendSuccess(res, 200, 'Login exitoso', {
            user: user.toJSON(),
            token
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return sendError(res, 404, 'Usuario no encontrado');
        }
        return sendSuccess(res, 200, 'Perfil recuperado', { user: user.toJSON() });
    } catch (error) {
        next(error);
    }
};
