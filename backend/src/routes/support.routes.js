import { Router } from 'express';
import { createTicket } from '../controllers/support.controller.js';
import { supportValidator } from '../validators/support.validator.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/support
 * @desc  Crea un nuevo ticket de soporte con validación previa
 * @access Private (Requiere estar autenticado)
 */
router.post('/', verifyToken, supportValidator, createTicket);


export default router;
