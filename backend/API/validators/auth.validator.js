import { body } from 'express-validator';

export const registerValidator = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('username')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('El username solo puede contener letras y números'),
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
