import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendVerificationEmail } from '../services/mailer.service.js';
import { analyzeAchievements } from '../services/gamificationEngine.js';

// In-memory store for email-change OTPs { userId → { code, newEmail, expiresAt } }
const emailChangeOtpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * PATCH /api/profile/name
 * Actualizar nombre del usuario
 */
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

/**
 * PATCH /api/profile/avatar
 * Actualizar foto de perfil (URL o base64)
 */
export const updateAvatar = async (req, res, next) => {
    try {
        const { avatar_url } = req.body;

        if (!avatar_url) {
            return sendError(res, 400, 'No se recibió ninguna imagen.');
        }

        if (avatar_url.length > 800000) {
            return sendError(res, 400, 'La imagen es demasiado grande. Máximo 500KB.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.avatar_url = avatar_url;
        await user.save();

        return sendSuccess(res, 200, 'Foto de perfil actualizada.', {
            avatar_url: user.avatar_url,
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/profile/biometrics
 * Actualizar datos biométricos (peso, altura, edad, género, nivel de actividad, meta de peso)
 */
export const updateBiometrics = async (req, res, next) => {
    try {
        const { peso, altura, edad, genero, nivel_actividad, meta_peso } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        if (peso !== undefined) user.peso = peso ? parseFloat(peso) : null;
        if (altura !== undefined) user.altura = altura ? parseFloat(altura) : null;
        if (edad !== undefined) user.edad = edad ? parseInt(edad) : null;
        if (genero !== undefined) user.genero = genero ? genero.trim() : null;
        if (nivel_actividad !== undefined) user.nivel_actividad = nivel_actividad ? nivel_actividad.trim() : null;
        if (meta_peso !== undefined) user.meta_peso = meta_peso ? parseFloat(meta_peso) : null;

        await user.save();

        // Evaluar logros de perfil (Perfil de Alta Precisión 👤)
        analyzeAchievements(user.id).catch(console.error);

        return sendSuccess(res, 200, 'Métricas biométricas actualizadas correctamente.', {
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/profile/bio
 * Actualizar biografía / descripción del usuario
 */
export const updateBio = async (req, res, next) => {
    try {
        const { bio } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        user.bio = bio ? bio.trim() : null;
        await user.save();

        return sendSuccess(res, 200, 'Biografía actualizada correctamente.', {
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/profile/change-password
 * Cambiar contraseña ingresando la contraseña actual
 */
export const changePasswordDirect = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, 400, 'La contraseña actual y la nueva contraseña son requeridas.');
        }

        if (newPassword.length < 6) {
            return sendError(res, 400, 'La nueva contraseña debe tener al menos 6 caracteres.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        // Verificar contraseña actual
        if (user.password_hash) {
            const isMatch = await user.verifyPassword(currentPassword);
            if (!isMatch) {
                return sendError(res, 401, 'La contraseña actual es incorrecta.');
            }
        }

        user.password_hash = newPassword;
        await user.save();

        return sendSuccess(res, 200, '¡Contraseña actualizada con éxito!');
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/profile/request-email-change
 * Solicitar cambio de correo electrónico enviando OTP al NUEVO correo
 */
export const requestEmailChange = async (req, res, next) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            return sendError(res, 400, 'Ingresa un correo electrónico válido.');
        }

        const existing = await User.findOne({ where: { email: newEmail.toLowerCase().trim() } });
        if (existing) {
            return sendError(res, 409, 'Este correo ya está registrado en otra cuenta.');
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return sendError(res, 404, 'Usuario no encontrado.');

        const otp = generateOTP();
        emailChangeOtpStore.set(req.user.id.toString(), {
            code: otp,
            newEmail: newEmail.toLowerCase().trim(),
            expiresAt: Date.now() + 15 * 60 * 1000
        });

        console.log(`🔑 [EMAIL CHANGE OTP] Código para ${newEmail}: ${otp}`);

        // Intentar envío real por Nodemailer
        try {
            await sendVerificationEmail(newEmail, user.nombre, otp);
        } catch (emailErr) {
            console.warn('⚠️ No se pudo enviar el correo por SMTP real (usando fallback de consola):', emailErr.message);
        }

        return sendSuccess(res, 200, `Código de verificación enviado a ${newEmail}. Revisa tu bandeja.`);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/profile/confirm-email-change
 * Confirmar cambio de correo ingresando el OTP de 6 dígitos
 */
export const confirmEmailChange = async (req, res, next) => {
    try {
        const { otp } = req.body;

        if (!otp) return sendError(res, 400, 'El código de 6 dígitos es requerido.');

        const record = emailChangeOtpStore.get(req.user.id.toString());

        if (!record) return sendError(res, 400, 'No hay una solicitud activa. Inicia el proceso nuevamente.');
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

        return sendSuccess(res, 200, '¡Correo electrónico actualizado correctamente!', {
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};
