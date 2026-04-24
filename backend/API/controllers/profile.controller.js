import User from '../../SQL/models/user.model.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { sendPasswordResetEmail } from '../services/mailer.service.js';

// In-memory store for email-change OTPs { email → { code, newEmail, expiresAt } }
const emailChangeOtpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── PATCH /api/profile/name ─────────────────────────────────────────────────
export const updateName = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre || nombre.trim().length < 2) {
            return sendError(res, 400, 'El nombre debe tener al menos 2 caracteres.');
        }
        if (nombre.trim().length > 50) {
            return sendError(res, 400, 'El nombre no puede superar los 50 caracteres.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.nombre = nombre.trim();
        await user.save();

        return sendSuccess(res, 200, 'Nombre actualizado correctamente.', {
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// ─── PATCH /api/profile/avatar ────────────────────────────────────────────────
export const updateAvatar = async (req, res, next) => {
    try {
        const { avatar_url } = req.body;

        if (!avatar_url) {
            return sendError(res, 400, 'No se recibió ninguna imagen.');
        }

        // Basic size guard: base64 of 400KB image ~= 546KB string
        if (avatar_url.length > 600000) {
            return sendError(res, 400, 'La imagen es demasiado grande. Máximo 400KB.');
        }

        // Validate it's a data URL image
        if (!avatar_url.startsWith('data:image/')) {
            return sendError(res, 400, 'Formato de imagen inválido.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.avatar_url = avatar_url;
        await user.save();

        return sendSuccess(res, 200, 'Foto de perfil actualizada.', {
            avatar_url: user.avatar_url
        });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/profile/request-email-change ───────────────────────────────────
// Sends OTP to the NEW email address for verification
export const requestEmailChange = async (req, res, next) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            return sendError(res, 400, 'Ingresa un correo válido.');
        }

        // Check new email isn't already taken
        const existing = await User.findOne({ where: { email: newEmail } });
        if (existing) {
            return sendError(res, 409, 'Este correo ya está en uso por otra cuenta.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        const otp = generateOTP();
        emailChangeOtpStore.set(req.user.id.toString(), {
            code: otp,
            newEmail,
            expiresAt: Date.now() + 15 * 60 * 1000
        });

        // Build a simple OTP email (reuse same function, different subject via override)
        await sendPasswordResetEmail(newEmail, user.nombre, otp);

        return sendSuccess(res, 200, `Código de verificación enviado a ${newEmail}. Revisa tu bandeja.`);
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/profile/confirm-email-change ───────────────────────────────────
export const confirmEmailChange = async (req, res, next) => {
    try {
        const { otp } = req.body;

        if (!otp) return sendError(res, 400, 'El código es requerido.');

        const record = emailChangeOtpStore.get(req.user.id.toString());

        if (!record) return sendError(res, 400, 'No hay una solicitud de cambio activa. Inicia el proceso nuevamente.');
        if (Date.now() > record.expiresAt) {
            emailChangeOtpStore.delete(req.user.id.toString());
            return sendError(res, 400, 'El código ha expirado. Solicita uno nuevo.');
        }
        if (record.code !== otp.trim()) {
            return sendError(res, 401, 'Código incorrecto. Verifica e intenta de nuevo.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.email = record.newEmail;
        await user.save();
        emailChangeOtpStore.delete(req.user.id.toString());

        return sendSuccess(res, 200, '¡Correo actualizado correctamente!', {
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};
