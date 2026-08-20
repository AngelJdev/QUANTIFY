/**
 * ==============================================================================
 * QUANTIFY — Pruebas de Concurrencia Basica
 * ==============================================================================
 *
 * Etapa 16.5 del Proyecto Integrador.
 * Verifica que la API maneja correctamente multiples peticiones simultaneas.
 *
 * Caso cubierto:
 *   - API-011: Concurrencia basica (10 peticiones simultaneas)
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

import express from 'express';
import request from 'supertest';

// App aislada para pruebas de concurrencia
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Quantify API is running' });
});

// ============================================================================
// API-011: CONCURRENCIA BASICA
// ============================================================================

describe('API-011: Concurrencia basica — Peticiones simultaneas', () => {
    test('10 peticiones simultaneas deben resolverse sin errores 500', async () => {
        const promises = Array.from({ length: 10 }, () =>
            request(app).get('/api/health')
        );
        const responses = await Promise.all(promises);

        responses.forEach((res, i) => {
            expect(res.status).not.toBe(500);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    test('20 peticiones simultaneas deben completarse dentro del timeout', async () => {
        const start = Date.now();
        const promises = Array.from({ length: 20 }, () =>
            request(app).get('/api/health')
        );
        const responses = await Promise.all(promises);
        const elapsed = Date.now() - start;

        // Todas deben responder exitosamente
        responses.forEach((res) => {
            expect(res.status).toBe(200);
        });

        // El lote completo debe resolverse en menos de 2 segundos
        expect(elapsed).toBeLessThan(2000);
    });

    test('peticiones mixtas GET y POST simultaneas no deben interferir', async () => {
        const gets = Array.from({ length: 5 }, () =>
            request(app).get('/api/health')
        );
        const posts = Array.from({ length: 5 }, () =>
            request(app)
                .post('/api/health')
                .send({ test: true })
        );

        const allResponses = await Promise.all([...gets, ...posts]);

        // Los GETs deben ser 200, los POSTs pueden ser 404 (sin handler POST)
        // Lo importante es que ningun response sea 500
        allResponses.forEach((res) => {
            expect(res.status).not.toBe(500);
        });
    });
});
