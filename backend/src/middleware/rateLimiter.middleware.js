import rateLimit from 'express-rate-limit';

// Limitador estricto para rutas de autenticación (Login, Registro, Recuperación de contraseña)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    limit: 15, // Límite de 15 solicitudes por IP por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes de autenticación desde esta dirección IP. Por favor, intenta nuevamente después de 15 minutos.'
    },
    standardHeaders: true, // Devuelve información de límite de tarifa en las cabeceras standard `RateLimit-*`
    legacyHeaders: false, // Desactiva las cabeceras heredadas `X-RateLimit-*`
});

// Limitador general para evitar abuso masivo de APIs por bots
export const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Ventana de 10 minutos
    limit: 300, // Límite de 300 solicitudes por IP
    message: {
        success: false,
        message: 'Has excedido el límite de solicitudes permitido para este intervalo de tiempo.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
