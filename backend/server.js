import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { Server as SocketIOServer } from 'socket.io';

// ============================================================
// CONFIGURACIÓN
// ============================================================

dotenv.config();

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// BASES DE DATOS
// ============================================================

import { connectMySQL } from './SQL/config/db.mysql.js';
import { connectMongo } from './NoSQL/config/db.mongo.js';

// ============================================================
// MIDDLEWARES
// ============================================================

import {
    errorHandler,
    notFound
} from './API/middleware/error.middleware.js';

// ============================================================
// SWAGGER
// ============================================================

import {
    swaggerSpec,
    swaggerUi
} from './API/docs/swagger.config.js';

// ============================================================
// ROUTES
// ============================================================

import authRoutes from './API/routes/auth.routes.js';
import habitRoutes from './API/routes/habit.routes.js';
import logRoutes from './API/routes/log.routes.js';
import adminRoutes from './API/routes/admin.routes.js';
import onboardingRoutes from './API/routes/onboarding.routes.js';
import achievementRoutes from './API/routes/achievement.routes.js';
import profileRoutes from './API/routes/profile.routes.js';
import supportRoutes from './API/routes/support.routes.js';
import populateRoutes from './API/routes/populate.routes.js';
import externalRoutes from './API/routes/external.routes.js';
import smartwatchRoutes from './API/routes/smartwatch.routes.js';
import analyticsRoutes from './API/routes/analytics.routes.js';

// ============================================================
// MODELOS MYSQL
// ============================================================

import './SQL/models/user.model.js';
import './SQL/models/habit.model.js';
import './SQL/models/userMetric.model.js';
import './SQL/models/achievement.model.js';
import './SQL/models/bitacora.model.js';

// ============================================================
// EXPRESS
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARES
// ============================================================

app.set('trust proxy', true);

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

app.use(morgan('dev'));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ============================================================
// RUTAS API
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/populate', populateRoutes);

// Motor analítico
app.use('/api/analytics', analyticsRoutes);

// Servicios externos
app.use('/api/external', externalRoutes);

// Smartwatch
app.use('/api/smartwatch', smartwatchRoutes);

// ============================================================
// SWAGGER
// ============================================================

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Quantify API — Población de Datos'
    })
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {

    res.status(200).json({
        status: 'OK',
        message: 'Quantify API is running',
        mysql: 'connected',
        mongodb: 'connected'
    });

});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFound);

app.use(errorHandler);

// ============================================================
// CONFIGURACIÓN DEL PUERTO
// ============================================================

const PORT = Number(process.env.PORT) || 5000;

// ============================================================
// SSL
// ============================================================

const privateKeyPath = path.join(
    __dirname,
    'ssl',
    'server.key'
);

const certificatePath = path.join(
    __dirname,
    'ssl',
    'server.cert'
);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

const startServer = async () => {

    try {

        console.log('');
        console.log('========================================');
        console.log('🚀 INICIANDO QUANTIFY BACKEND');
        console.log('========================================');

        // ========================================================
        // MYSQL
        // ========================================================

        console.log('🔄 Conectando a MySQL...');

        await connectMySQL();

        console.log('✅ MySQL conectado correctamente.');

        // ========================================================
        // MONGODB
        // ========================================================

        console.log('🔄 Conectando a MongoDB...');

        await connectMongo();

        console.log('✅ MongoDB conectado correctamente.');

        // ========================================================
        // SINCRONIZAR MYSQL
        // ========================================================

        const {
            default: sequelize
        } = await import('./SQL/config/db.mysql.js');

        console.log('🔄 Sincronizando modelos MySQL...');

        await sequelize.sync({
            alter: process.env.NODE_ENV !== 'production'
        });

        console.log('✅ Database models synchronized (MySQL).');

        // ========================================================
        // SEED ADMIN
        // ========================================================

        try {

            const {
                seedAdmins
            } = await import('./SQL/seeds/adminSeed.js');

            await seedAdmins();

            console.log('✅ Admin users initialized.');

        } catch (seedError) {

            console.warn(
                '⚠️ Admin seed warning:',
                seedError.message
            );

        }

        // ========================================================
        // CREAR SERVIDOR HTTP/HTTPS
        // ========================================================

        let server;

        const sslExists =
            fs.existsSync(privateKeyPath) &&
            fs.existsSync(certificatePath);

        if (sslExists) {

            console.log('🔐 Certificados SSL encontrados.');

            const credentials = {

                key: fs.readFileSync(
                    privateKeyPath,
                    'utf8'
                ),

                cert: fs.readFileSync(
                    certificatePath,
                    'utf8'
                )

            };

            server = https.createServer(
                credentials,
                app
            );

        } else {

            console.log(
                '⚠️ Certificados SSL no encontrados.'
            );

            console.log(
                '🌐 Utilizando HTTP.'
            );

            server = http.createServer(app);

        }

        // ========================================================
        // SOCKET.IO
        // ========================================================

        const io = new SocketIOServer(server, {

            cors: {

                origin: '*',

                methods: [
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE',
                    'PATCH'
                ],

                credentials: true

            }

        });

        // Guardar Socket.IO en Express
        app.set('io', io);

        // ========================================================
        // SOCKET CONNECTION
        // ========================================================

        io.on('connection', (socket) => {

            console.log(
                `🔌 Socket conectado: ${socket.id}`
            );

            // ----------------------------------------------------
            // ROOM DE USUARIO
            // ----------------------------------------------------

            socket.on(
                'join_user_room',
                (userId) => {

                    if (!userId) {
                        return;
                    }

                    socket.join(
                        `user_${userId}`
                    );

                    console.log(
                        `👤 Usuario ${userId} unido a su room`
                    );

                }
            );

            // ----------------------------------------------------
            // DISCONNECT
            // ----------------------------------------------------

            socket.on(
                'disconnect',
                () => {

                    console.log(
                        `🔌 Socket desconectado: ${socket.id}`
                    );

                }
            );

        });

        // ========================================================
        // START LISTENING
        // ========================================================

        server.listen(
            PORT,
            '0.0.0.0',
            () => {

                console.log('');
                console.log('========================================');
                console.log('✅ QUANTIFY BACKEND INICIADO');
                console.log('========================================');

                if (sslExists) {

                    console.log(
                        `🔐 HTTPS: https://localhost:${PORT}`
                    );

                    console.log(
                        `🔌 Socket.IO: wss://localhost:${PORT}`
                    );

                } else {

                    console.log(
                        `🌐 HTTP: http://localhost:${PORT}`
                    );

                    console.log(
                        `🔌 Socket.IO: ws://localhost:${PORT}`
                    );

                }

                console.log(
                    `❤️ Health: http://localhost:${PORT}/api/health`
                );

                console.log(
                    `📚 Swagger: http://localhost:${PORT}/api-docs`
                );

                console.log('========================================');
                console.log('');

            }
        );

    } catch (error) {

        console.error('');
        console.error('========================================');
        console.error('❌ ERROR INICIANDO QUANTIFY');
        console.error('========================================');

        console.error(error);

        console.error('========================================');
        console.error('');

        process.exit(1);

    }

};

// ============================================================
// ARRANCAR
// ============================================================

startServer();

export default app;