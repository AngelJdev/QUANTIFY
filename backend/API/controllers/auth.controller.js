import jwt from 'jsonwebtoken';
import User from '../../SQL/models/user.model.js';
import UserMetric from '../../SQL/models/userMetric.model.js';
import sequelize from '../../SQL/config/db.mysql.js';
import { jwtConfig } from '../../config/jwt.config.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { processUserGamification } from '../services/gamificationEngine.js';
import { sendPasswordResetEmail } from '../services/mailer.service.js';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, rol: user.rol }, 
        jwtConfig.secret, 
        { expiresIn: jwtConfig.expiresIn }
    );
};

export const register = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { nombre, email, password, metrics, securityPhrase, pais } = req.body;

        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            await transaction.rollback();
            return sendError(res, 400, 'El correo electrónico ya está en uso');
        }

        const newUser = await User.create({
            nombre,
            email,
            password_hash: password,
            security_phrase_hash: securityPhrase,
            pais: pais || 'México'
        }, { transaction });

        if (metrics) {
            await UserMetric.create({
                usuario_id: newUser.id,
                ...metrics
            }, { transaction });
        }

        await transaction.commit();

        const token = generateToken(newUser);

        return sendSuccess(res, 201, 'Usuario registrado exitosamente', {
            user: { ...newUser.toJSON(), needsOnboarding: false },
            token
        });
    } catch (error) {
        if (transaction && !transaction.finished) await transaction.rollback();
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

        // Process Streaks and Achievements upon login
        const updatedUser = await processUserGamification(user);

        const token = generateToken(updatedUser);

        const metrics = await UserMetric.findOne({ where: { usuario_id: updatedUser.id } });
        const needsOnboarding = !metrics;

        return sendSuccess(res, 200, 'Login exitoso', {
            user: { ...updatedUser.toJSON(), needsOnboarding },
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
        const metrics = await UserMetric.findOne({ where: { usuario_id: user.id } });
        return sendSuccess(res, 200, 'Perfil recuperado', { 
            user: { ...user.toJSON(), needsOnboarding: !metrics } 
        });
    } catch (error) {
        next(error);
    }
};



// In-memory OTP store: { email → { code, expiresAt } }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /auth/forgot-password  — sends OTP via Mailtrap
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return sendError(res, 400, 'El correo es requerido.');

        const user = await User.findOne({ where: { email } });
        // Always respond the same to prevent email enumeration
        if (!user) {
            return sendSuccess(res, 200, 'Si el correo existe, recibirás un código en breve.');
        }

        const otp = generateOTP();
        otpStore.set(email, { code: otp, expiresAt: Date.now() + 15 * 60 * 1000 });

        await sendPasswordResetEmail(email, user.nombre, otp);

        return sendSuccess(res, 200, 'Código de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (error) {
        next(error);
    }
};

// POST /auth/reset-password  — validates OTP and sets new password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return sendError(res, 400, 'Todos los campos son requeridos.');
        }
        if (newPassword.length < 6) {
            return sendError(res, 400, 'La contraseña debe tener al menos 6 caracteres.');
        }

        const record = otpStore.get(email);
        if (!record) return sendError(res, 400, 'No hay una solicitud activa para este correo. Inicia el proceso nuevamente.');
        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return sendError(res, 400, 'El código ha expirado. Solicita uno nuevo.');
        }
        if (record.code !== otp.trim()) {
            return sendError(res, 401, 'Código incorrecto. Verifica e intenta de nuevo.');
        }

        const user = await User.findOne({ where: { email } });
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.password_hash = newPassword; // beforeUpdate hook will hash it
        await user.save();
        otpStore.delete(email);

        return sendSuccess(res, 200, '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
    } catch (error) {
        next(error);
    }
};
