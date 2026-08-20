/**
 * ==============================================================================
 * QUANTIFY — Pruebas de Validacion de la API REST
 * ==============================================================================
 *
 * Etapa 16.5 del Proyecto Integrador.
 * Valida el comportamiento de la API ante solicitudes con campos faltantes,
 * tipos incorrectos, valores fuera de rango y formato de respuestas de error.
 *
 * Casos cubiertos:
 *   - API-004: Campos faltantes en registro
 *   - API-007: Tipos de datos incorrectos
 *   - API-008: Recursos inexistentes
 *   - API-010: Formato de respuestas de error
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

import express from 'express';
import request from 'supertest';
import { body, validationResult } from 'express-validator';

// ============================================================================
// CONFIGURACION DE APP DE PRUEBA AISLADA
// ============================================================================

/**
 * Crea una app Express minima que replica la logica de validacion
 * del backend sin depender de conexion a base de datos.
 */
function createTestApp() {
    const app = express();
    app.use(express.json());

    // Middleware de validacion (replica de validate.middleware.js)
    const validateRequest = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validacion',
                errors: errors.array()
            });
        }
        next();
    };

    // Endpoint de registro con validacion
    app.post('/api/auth/register', [
        body('nombre')
            .notEmpty().withMessage('El nombre es obligatorio')
            .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
        body('username')
            .notEmpty().withMessage('El nombre de usuario es obligatorio')
            .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres')
            .matches(/^[a-zA-Z0-9]+$/).withMessage('El username solo puede contener letras y numeros'),
        body('email')
            .isEmail().withMessage('Debe ser un correo valido')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres')
    ], validateRequest, (req, res) => {
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: { user: { id: 1, ...req.body }, token: 'test-token-123' }
        });
    });

    // Endpoint de login con validacion
    app.post('/api/auth/login', [
        body('email').isEmail().withMessage('Debe ser un correo valido'),
        body('password').notEmpty().withMessage('La contrasena es obligatoria')
    ], validateRequest, (req, res) => {
        // Simular credenciales invalidas para ciertos casos
        if (req.body.password === 'wrong_password') {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: { token: 'test-token-123' }
        });
    });

    // Endpoint protegido (simula verificacion de token)
    app.get('/api/habits', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Habitos recuperados',
            data: []
        });
    });

    // Endpoint con validacion de habito
    app.post('/api/habits', [
        body('nombre').notEmpty().withMessage('El nombre del habito es obligatorio'),
        body('tipo_medicion')
            .optional()
            .isIn(['BOOLEANO', 'NUMERICO', 'TIEMPO'])
            .withMessage('Tipo de medicion invalido'),
        body('frecuencia')
            .optional()
            .isIn(['DIARIO', 'SEMANAL', 'PERSONALIZADO'])
            .withMessage('Frecuencia invalida'),
        body('meta_diaria')
            .optional()
            .isNumeric().withMessage('La meta diaria debe ser numerica'),
    ], validateRequest, (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided.'
            });
        }
        res.status(201).json({
            success: true,
            message: 'Habito creado',
            data: { id: 1, ...req.body }
        });
    });

    // Endpoint de recurso por ID
    app.get('/api/habits/:id', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided.'
            });
        }
        // Simular que solo existe el ID 1
        if (req.params.id !== '1') {
            return res.status(404).json({
                success: false,
                message: 'Habito no encontrado o no pertenece al usuario'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Habito encontrado',
            data: { id: 1, nombre: 'Meditar' }
        });
    });

    // Manejo 404
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `Not Found - ${req.originalUrl}`
        });
    });

    return app;
}

const app = createTestApp();

// ============================================================================
// API-004: CAMPOS FALTANTES EN REGISTRO
// ============================================================================

describe('API-004: POST /api/auth/register — Campos faltantes', () => {
    test('sin nombre debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test123', email: 'test@example.com', password: '123456' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('sin email debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Test User', username: 'test123', password: '123456' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('sin password debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Test User', username: 'test123', email: 'test@example.com' });
        expect(res.status).toBe(400);
    });

    test('sin username debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Test User', email: 'test@example.com', password: '123456' });
        expect(res.status).toBe(400);
    });

    test('body completamente vacio debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('nombre demasiado corto (< 3 chars) debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'AB', username: 'test123', email: 'test@example.com', password: '123456' });
        expect(res.status).toBe(400);
    });

    test('password demasiado corto (< 6 chars) debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Test User', username: 'test123', email: 'test@example.com', password: '123' });
        expect(res.status).toBe(400);
    });
});

// ============================================================================
// API-002: REGISTRO EXITOSO
// ============================================================================

describe('API-002: POST /api/auth/register — Datos validos', () => {
    test('registro con datos completos debe retornar 201', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Angel de Jesus',
                username: 'angeljesus13',
                email: 'angel@quantify.com',
                password: 'SecurePass123'
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });
});

// ============================================================================
// API-005: CREDENCIALES INCORRECTAS
// ============================================================================

describe('API-005: POST /api/auth/login — Credenciales incorrectas', () => {
    test('contrasena incorrecta debe retornar 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'angel@quantify.com', password: 'wrong_password' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('email invalido debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'not-an-email', password: '123456' });
        expect(res.status).toBe(400);
    });

    test('sin contrasena debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'angel@quantify.com' });
        expect(res.status).toBe(400);
    });
});

// ============================================================================
// API-006: ACCESO SIN TOKEN
// ============================================================================

describe('API-006: GET /api/habits — Sin token de autenticacion', () => {
    test('sin header Authorization debe retornar 401', async () => {
        const res = await request(app).get('/api/habits');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('con token valido debe retornar 200', async () => {
        const res = await request(app)
            .get('/api/habits')
            .set('Authorization', 'Bearer test-token-123');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ============================================================================
// API-007: TIPOS DE DATOS INCORRECTOS
// ============================================================================

describe('API-007: POST /api/habits — Tipos de datos incorrectos', () => {
    test('tipo_medicion invalido debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', 'Bearer test-token-123')
            .send({
                nombre: 'Meditar',
                tipo_medicion: 'INVALIDO'
            });
        expect(res.status).toBe(400);
    });

    test('frecuencia invalida debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', 'Bearer test-token-123')
            .send({
                nombre: 'Correr',
                frecuencia: 'MENSUAL'
            });
        expect(res.status).toBe(400);
    });

    test('meta_diaria no numerica debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', 'Bearer test-token-123')
            .send({
                nombre: 'Leer',
                meta_diaria: 'treinta'
            });
        expect(res.status).toBe(400);
    });

    test('sin nombre de habito debe retornar 400', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', 'Bearer test-token-123')
            .send({
                tipo_medicion: 'BOOLEANO'
            });
        expect(res.status).toBe(400);
    });
});

// ============================================================================
// API-008: RECURSO INEXISTENTE
// ============================================================================

describe('API-008: GET /api/habits/:id — ID inexistente', () => {
    test('ID inexistente debe retornar 404', async () => {
        const res = await request(app)
            .get('/api/habits/99999')
            .set('Authorization', 'Bearer test-token-123');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('ruta completamente inexistente debe retornar 404', async () => {
        const res = await request(app)
            .get('/api/ruta/que/no/existe');
        expect(res.status).toBe(404);
    });
});

// ============================================================================
// API-010: FORMATO DE RESPUESTAS DE ERROR
// ============================================================================

describe('API-010: Formato uniforme de respuestas de error', () => {
    test('error 400 debe contener campo success=false', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});
        expect(res.body).toHaveProperty('success', false);
    });

    test('error 400 debe contener campo message', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});
        expect(res.body).toHaveProperty('message');
        expect(typeof res.body.message).toBe('string');
    });

    test('error 401 debe contener formato JSON uniforme', async () => {
        const res = await request(app).get('/api/habits');
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message');
    });

    test('error 404 debe contener formato JSON uniforme', async () => {
        const res = await request(app).get('/api/no-existe');
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message');
    });
});
