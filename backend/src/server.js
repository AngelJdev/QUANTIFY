import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMySQL } from './config/db.mysql.js';
import { connectMongo } from './config/db.mongo.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habit.routes.js';
import logRoutes from './routes/log.routes.js';
import adminRoutes from './routes/admin.routes.js';

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
    const { default: sequelize } = await import('./config/db.mysql.js');
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ Database models synchronized (MySQL).');
}).catch(err => {
    console.error('Failed to initialize databases:', err);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);

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
