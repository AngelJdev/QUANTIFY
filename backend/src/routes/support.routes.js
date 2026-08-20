import express from 'express';
import {
    createTicket,
    getMyTickets,
    getAdminTickets,
    replyAdminTicket
} from '../controllers/support.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas de Usuario (requieren login)
router.post('/', verifyToken, createTicket);
router.get('/my-tickets', verifyToken, getMyTickets);

// Rutas de Administrador / Moderador (requieren login y rol admin/mod)
router.get('/admin/tickets', verifyToken, getAdminTickets);
router.patch('/admin/tickets/:ticketId', verifyToken, replyAdminTicket);

export default router;
