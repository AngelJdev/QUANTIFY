import { body } from 'express-validator';

export const habitValidator = [
    body('nombre').notEmpty().withMessage('El nombre del hábito es obligatorio'),
    body('tipo_medicion')
        .optional()
        .isIn(['BOOLEANO', 'NUMERICO', 'TIEMPO'])
        .withMessage('Tipo de medición inválido'),
    body('frecuencia')
        .optional()
        .isIn(['DIARIO', 'SEMANAL', 'PERSONALIZADO'])
        .withMessage('Frecuencia inválida'),
    body('meta_diaria')
        .optional()
        .isNumeric().withMessage('La meta diaria debe ser numérica'),
    body('unidad')
        .optional()
        .isString(),
    body('descripcion')
        .optional()
        .isString(),
    body('fecha_fin')
        .optional()
        .isISO8601().withMessage('La fecha de fin debe tener formato válido'),
    body('duracion_tipo')
        .optional()
        .isString()
];
