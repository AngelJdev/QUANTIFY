import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMySQL } from './config/db.mysql.js';
import { connectMongo } from './config/db.mongo.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { setIO } from './utils/socket.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './config/jwt.config.js';
import { registerCommunityHandlers } from './sockets/community.socket.js';
import { registerChallengeHandlers } from './sockets/challenge.socket.js';
import { registerFeedHandlers } from './sockets/feed.socket.js';
import {
    configureCommunityScaling,
    initializeCommunitySchema
} from './services/communityRuntime.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habit.routes.js';
import logRoutes from './routes/log.routes.js';
import adminRoutes from './routes/admin.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import profileRoutes from './routes/profile.routes.js';
import aiRoutes from './routes/ai.routes.js';
import smartwatchRoutes from './routes/smartwatch.routes.js';

// Pre-load relationships & Models to trigger automatic sync
import './models/user.model.js';
import './models/habit.model.js';
import './models/userMetric.model.js';
import './models/achievement.model.js';
import './models/friendship.model.js';
import './models/challenge.model.js';
import './models/communityPost.model.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connections (Trigger sync on start for MySQL)
Promise.all([connectMySQL(), connectMongo()]).then(async () => {
    // Note: In production you might want to run migrations instead of sync()
    // Running sync({ alter: true }) in Vercel causes deadlocks when multiple instances spin up.
    // Database schema is managed explicitly via migrations / manual scripts to prevent column drops.
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        const { default: sequelize } = await import('./config/db.mysql.js');
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized (MySQL).');
        
        // Seed admin users
        const { seedAdmins } = await import('./seeds/adminSeed.js');
        await seedAdmins();
    } else {
        console.log('✅ Production mode: Skipping DB Sync and Seeding to prevent deadlocks.');
        await initializeCommunitySchema();
    }
}).catch(err => {
    console.error('Failed to initialize databases:', err);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/smartwatch', smartwatchRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Quantify API is running' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});
setIO(io);
app.set('io', io);

// Se conserva el canal principal para los modulos que ya existian.
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User joined room: user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// Comunidad vive en su propio namespace para que sus errores no afecten a
// administracion, analitica ni a los demas sockets de la aplicacion.
const communityIO = io.of('/community');

configureCommunityScaling(communityIO).catch((error) => {
    console.error('⚠️ Community socket scaling could not be enabled:', error.message);
});

const onlineUsers = new Map();

communityIO.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('AUTH_REQUIRED'));

        const decoded = jwt.verify(token, jwtConfig.secret);
        if (decoded.device) return next(new Error('AUTH_INVALID'));
        const user = await (await import('./models/user.model.js')).default.findByPk(decoded.id, {
            attributes: ['id', 'rol']
        });
        if (!user) return next(new Error('AUTH_INVALID'));

        socket.user = { id: user.id, rol: user.rol };
        next();
    } catch (_error) {
        next(new Error('AUTH_INVALID'));
    }
});

communityIO.on('connection', (socket) => {
    const userId = socket.user.id;
    const existingSockets = onlineUsers.get(userId) || new Set();
    const wasOffline = existingSockets.size === 0;

    existingSockets.add(socket.id);
    onlineUsers.set(userId, existingSockets);
    socket.join(`user_${userId}`);
    console.log(`🔌 Socket connected: ${socket.id} (user ${userId})`);

    if (wasOffline) communityIO.emit('community:presence_changed', { userId, online: true });

    // Compatibilidad con clientes anteriores, sin permitir entrar a salas ajenas.
    socket.on('join_user_room', () => socket.join(`user_${userId}`));
    registerCommunityHandlers(communityIO, socket, onlineUsers);
    registerChallengeHandlers(communityIO, socket, onlineUsers);
    registerFeedHandlers(communityIO, socket, onlineUsers);

    socket.on('disconnect', () => {
        const userSockets = onlineUsers.get(userId);
        userSockets?.delete(socket.id);

        if (!userSockets?.size) {
            onlineUsers.delete(userId);
            communityIO.emit('community:presence_changed', { userId, online: false });
        }

        console.log(`🔌 Socket disconnected: ${socket.id} (user ${userId})`);
    });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Vercel necesita el servidor HTTP para conservar la actualizacion a WebSocket.
// Express sigue atendiendo las rutas /api mediante este mismo servidor.
export default httpServer;
