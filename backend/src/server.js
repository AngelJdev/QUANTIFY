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

// Routes
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habit.routes.js';
import logRoutes from './routes/log.routes.js';
import adminRoutes from './routes/admin.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import profileRoutes from './routes/profile.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Pre-load relationships & Models to trigger automatic sync
import './models/user.model.js';
import './models/habit.model.js';
import './models/userMetric.model.js';
import './models/achievement.model.js';

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
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        const { default: sequelize } = await import('./config/db.mysql.js');
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized (MySQL).');
        
        // Seed admin users
        const { seedAdmins } = await import('./seeds/adminSeed.js');
        await seedAdmins();
    } else {
        console.log('✅ Production mode: Skipping DB Sync and Seeding to prevent deadlocks.');
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

app.get('/api/health', async (req, res) => {
    try {
        const { default: sequelize } = await import('./config/db.mysql.js');
        const [cols] = await sequelize.query('SHOW COLUMNS FROM Users');
        const dbFields = cols.map(c => c.Field);
        
        res.status(200).json({ 
            status: 'OK', 
            host: process.env.MYSQL_HOST,
            db: process.env.MYSQL_DATABASE,
            env: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            userCols: dbFields,
            message: 'Quantify API is running' 
        });
    } catch(e) {
        res.status(500).json({ error: String(e), host: process.env.MYSQL_HOST });
    }
});

// Temporary endpoint to safely sync the db without deadlocks
app.get('/api/sys/sync-db', async (req, res) => {
    try {
        const { default: sequelize } = await import('./config/db.mysql.js');
        await sequelize.sync({ alter: true });
        res.status(200).json({ success: true, message: 'Database synced successfully on Vercel DB' });
    } catch(e) {
        res.status(500).json({ success: false, error: String(e) });
    }
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

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

export default app;
