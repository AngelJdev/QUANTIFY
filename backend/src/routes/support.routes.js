import express from 'express';
import { createTicket } from '../controllers/support.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createTicket);

export default router;
