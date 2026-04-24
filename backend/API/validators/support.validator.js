import { body, validationResult } from 'express-validator';

/**
 * Middleware de validación para tickets de soporte
 */
export const supportValidator = [
    body('asunto')
        .trim()
        .notEmpty().withMessage('El asunto no puede estar vacío')
        .isLength({ min: 5, max: 100 }).withMessage('El asunto debe tener entre 5 y 100 caracteres')
        .escape(), // Sanitización contra inyecciones
    
    body('email')
        .trim()
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
        .normalizeEmail(),
    
    body('mensaje')
        .trim()
        .notEmpty().withMessage('El mensaje es obligatorio')
        .isLength({ min: 20 }).withMessage('Por favor, describa su problema con al menos 20 caracteres')
        .escape(),

    body('prioridad')
        .isIn(['Baja', 'Media', 'Alta']).withMessage('Prioridad no válida'),

    // Middleware para manejar los errores de validación
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                status: 'error',
                errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
            });
        }
        next();
    }
];
