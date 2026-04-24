import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMySQL } from './SQL/config/db.mysql.js';
import { connectMongo } from './NoSQL/config/db.mongo.js';
import { errorHandler, notFound } from './API/middleware/error.middleware.js';

// Routes
import authRoutes from './API/routes/auth.routes.js';
import habitRoutes from './API/routes/habit.routes.js';
import logRoutes from './API/routes/log.routes.js';
import adminRoutes from './API/routes/admin.routes.js';
import onboardingRoutes from './API/routes/onboarding.routes.js';
import achievementRoutes from './API/routes/achievement.routes.js';
import profileRoutes from './API/routes/profile.routes.js';
import supportRoutes from './API/routes/support.routes.js';

// Pre-load relationships & Models to trigger automatic sync
import './SQL/models/user.model.js';
import './SQL/models/habit.model.js';
import './SQL/models/userMetric.model.js';
import './SQL/models/achievement.model.js';

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
    const { default: sequelize } = await import('./SQL/config/db.mysql.js');
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ Database models synchronized (MySQL).');

    // Seed admin users
    const { seedAdmins } = await import('./SQL/seeds/adminSeed.js');
    await seedAdmins();
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
app.use('/api/support', supportRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Quantify API is running' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
