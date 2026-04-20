import { body } from 'express-validator';

export const registerValidator = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('email')
        .isEmail().withMessage('Debe ser un correo válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

export const loginValidator = [
    body('email')
        .isEmail().withMessage('Debe ser un correo válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];
