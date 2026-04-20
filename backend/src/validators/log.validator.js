import { body } from 'express-validator';

export const logValidator = [
    body('habito_id')
        .notEmpty().withMessage('El ID del hábito es obligatorio')
        .isInt().withMessage('El ID del hábito debe ser un número entero'),
    body('fecha_registro')
        .notEmpty().withMessage('La fecha de registro es obligatoria')
        .isISO8601().withMessage('Debe ser una fecha válida (YYYY-MM-DD)'),
    body('completado')
        .optional()
        .isBoolean().withMessage('Completado debe ser booleano'),
    body('valor_registrado')
        .optional()
        .isNumeric().withMessage('El valor registrado debe ser numérico'),
    body('notas')
        .optional()
        .isString()
];
