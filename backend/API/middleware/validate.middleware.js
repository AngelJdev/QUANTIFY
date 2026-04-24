import { validationResult } from 'express-validator';
import { sendError } from '../../utils/response.js';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));
        return sendError(res, 400, 'Validation Error', extractedErrors);
    }
    next();
};
