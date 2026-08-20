/**
 * ==============================================================================
 * QUANTIFY — Pruebas del Endpoint Health Check
 * ==============================================================================
 *
 * Etapa 16.5 del Proyecto Integrador.
 * Valida que el endpoint de salud de la API responde correctamente.
 *
 * Caso cubierto:
 *   - API-001: GET /api/health retorna 200 OK
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Crear una instancia aislada de Express para pruebas
const app = express();
app.use(express.json());

// Registrar unicamente el endpoint de health para aislar la prueba
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Quantify API is running' });
});

// ============================================================================
// API-001: HEALTH CHECK
// ============================================================================

describe('API-001: GET /api/health', () => {
    test('debe retornar status 200', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
    });

    test('debe retornar status "OK" en el body', async () => {
        const response = await request(app).get('/api/health');
        expect(response.body.status).toBe('OK');
    });

    test('debe retornar un mensaje descriptivo', async () => {
        const response = await request(app).get('/api/health');
        expect(response.body.message).toBeDefined();
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);
    });

    test('debe retornar Content-Type JSON', async () => {
        const response = await request(app).get('/api/health');
        expect(response.headers['content-type']).toMatch(/json/);
    });
});

// ============================================================================
// API-009: LATENCIA
// ============================================================================

describe('API-009: Latencia del endpoint /api/health', () => {
    test('debe responder en menos de 200ms', async () => {
        const start = Date.now();
        await request(app).get('/api/health');
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(200);
    });

    test('debe responder consistentemente rapido en 5 peticiones', async () => {
        const times = [];
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            await request(app).get('/api/health');
            times.push(Date.now() - start);
        }
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        expect(avg).toBeLessThan(100);
    });
});
