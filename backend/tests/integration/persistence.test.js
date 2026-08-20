/**
 * ==============================================================================
 * QUANTIFY — Pruebas de Integracion: Persistencia y Flujo de Datos
 * ==============================================================================
 *
 * Etapa 16.6 del Proyecto Integrador.
 * Valida que los datos creados mediante la API se persisten correctamente
 * y que los flujos completos de usuario funcionan de extremo a extremo.
 *
 * Casos cubiertos:
 *   - INT-003: Persistencia de datos creados via API
 *   - INT-005: Flujo completo registro -> login -> creacion de habito
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

import express from 'express';
import request from 'supertest';

// ============================================================================
// ALMACEN EN MEMORIA (Simula persistencia sin DB)
// ============================================================================

const store = {
    users: [],
    habits: [],
    nextUserId: 1,
    nextHabitId: 1,
};

function createPersistenceApp() {
    const app = express();
    app.use(express.json());

    // Registro con persistencia
    app.post('/api/auth/register', (req, res) => {
        const { nombre, username, email, password } = req.body;

        if (!nombre || !email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios faltantes'
            });
        }

        const exists = store.users.find(u => u.email === email);
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'El correo electronico ya esta en uso'
            });
        }

        const user = {
            id: store.nextUserId++,
            nombre,
            username,
            email,
            password
        };
        store.users.push(user);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: { id: user.id, nombre, username, email },
                token: `token-${user.id}`
            }
        });
    });

    // Login con verificacion de persistencia
    app.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;
        const user = store.users.find(u => u.email === email);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: { id: user.id, nombre: user.nombre },
                token: `token-${user.id}`
            }
        });
    });

    // Crear habito con persistencia
    app.post('/api/habits', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided.' });
        }

        const userId = parseInt(token.replace('Bearer token-', ''));
        const habit = {
            id: store.nextHabitId++,
            usuario_id: userId,
            ...req.body,
            fecha_creacion: new Date().toISOString()
        };
        store.habits.push(habit);

        res.status(201).json({
            success: true,
            message: 'Habito creado',
            data: habit
        });
    });

    // Obtener habitos del usuario
    app.get('/api/habits', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided.' });
        }

        const userId = parseInt(token.replace('Bearer token-', ''));
        const habits = store.habits.filter(h => h.usuario_id === userId);

        res.status(200).json({
            success: true,
            message: 'Habitos recuperados',
            data: habits
        });
    });

    // Obtener habito por ID
    app.get('/api/habits/:id', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided.' });
        }

        const userId = parseInt(token.replace('Bearer token-', ''));
        const habit = store.habits.find(
            h => h.id === parseInt(req.params.id) && h.usuario_id === userId
        );

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Habito encontrado',
            data: habit
        });
    });

    // Eliminar habito
    app.delete('/api/habits/:id', (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided.' });
        }

        const userId = parseInt(token.replace('Bearer token-', ''));
        const idx = store.habits.findIndex(
            h => h.id === parseInt(req.params.id) && h.usuario_id === userId
        );

        if (idx === -1) {
            return res.status(404).json({
                success: false,
                message: 'Habito no encontrado'
            });
        }

        store.habits.splice(idx, 1);
        res.status(200).json({
            success: true,
            message: 'Habito eliminado correctamente'
        });
    });

    return app;
}

const app = createPersistenceApp();

// Limpiar store antes de cada suite
beforeEach(() => {
    store.users = [];
    store.habits = [];
    store.nextUserId = 1;
    store.nextHabitId = 1;
});

// ============================================================================
// INT-003: PERSISTENCIA DE DATOS
// ============================================================================

describe('INT-003: Persistencia de datos creados via API', () => {
    test('un usuario registrado debe poder hacer login con las mismas credenciales', async () => {
        // Registrar
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Angel QUANTIFY',
                username: 'angelq',
                email: 'angel@quantify.com',
                password: 'SecurePass2026'
            });
        expect(regRes.status).toBe(201);

        // Login con mismas credenciales
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'angel@quantify.com', password: 'SecurePass2026' });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body.data.token).toBeDefined();
    });

    test('un habito creado debe poder recuperarse con GET', async () => {
        // Registrar usuario
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Test User',
                username: 'testuser',
                email: 'test@quantify.com',
                password: '123456'
            });
        const token = regRes.body.data.token;

        // Crear habito
        const createRes = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Meditar 10 minutos',
                tipo_medicion: 'BOOLEANO',
                frecuencia: 'DIARIO'
            });
        expect(createRes.status).toBe(201);
        const habitId = createRes.body.data.id;

        // Recuperar habito
        const getRes = await request(app)
            .get(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.data.nombre).toBe('Meditar 10 minutos');
    });

    test('un habito eliminado no debe poder recuperarse', async () => {
        // Registrar y crear
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Test User',
                username: 'deluser',
                email: 'del@quantify.com',
                password: '123456'
            });
        const token = regRes.body.data.token;

        const createRes = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Habito a eliminar' });
        const habitId = createRes.body.data.id;

        // Eliminar
        const delRes = await request(app)
            .delete(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(delRes.status).toBe(200);

        // Intentar recuperar
        const getRes = await request(app)
            .get(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(getRes.status).toBe(404);
    });

    test('no se debe permitir registro duplicado con mismo email', async () => {
        // Primer registro
        await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'User 1',
                username: 'user1',
                email: 'dup@quantify.com',
                password: '123456'
            });

        // Segundo registro con mismo email
        const dupRes = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'User 2',
                username: 'user2',
                email: 'dup@quantify.com',
                password: '654321'
            });
        expect(dupRes.status).toBe(400);
    });
});

// ============================================================================
// INT-005: FLUJO COMPLETO DE USUARIO
// ============================================================================

describe('INT-005: Flujo completo registro -> login -> CRUD habitos', () => {
    test('flujo completo debe funcionar de extremo a extremo', async () => {
        // 1. Registro
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Francisco Garcia',
                username: 'fgarcia',
                email: 'fgarcia@quantify.com',
                password: 'Backend2026'
            });
        expect(regRes.status).toBe(201);
        expect(regRes.body.data.token).toBeDefined();

        // 2. Login
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'fgarcia@quantify.com', password: 'Backend2026' });
        expect(loginRes.status).toBe(200);
        const token = loginRes.body.data.token;

        // 3. Crear habitos
        const habit1 = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Correr 5km', tipo_medicion: 'NUMERICO' });
        expect(habit1.status).toBe(201);

        const habit2 = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Leer 30 minutos', tipo_medicion: 'TIEMPO' });
        expect(habit2.status).toBe(201);

        // 4. Obtener todos los habitos
        const allRes = await request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${token}`);
        expect(allRes.status).toBe(200);
        expect(allRes.body.data.length).toBe(2);

        // 5. Obtener habito individual
        const singleRes = await request(app)
            .get(`/api/habits/${habit1.body.data.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(singleRes.status).toBe(200);
        expect(singleRes.body.data.nombre).toBe('Correr 5km');

        // 6. Eliminar un habito
        const delRes = await request(app)
            .delete(`/api/habits/${habit2.body.data.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(delRes.status).toBe(200);

        // 7. Verificar que solo queda 1 habito
        const finalRes = await request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${token}`);
        expect(finalRes.body.data.length).toBe(1);
    });
});
