import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Quantify API — Población de Datos',
            version: '1.0.0',
            description: `
## Sistema de Población de Datos para Pruebas

Endpoints para poblar y limpiar datos de prueba en MySQL y MongoDB.

### Tests SQL (Total: 157,268 usuarios)
| Test | Cantidad | Descripción |
|------|----------|-------------|
| 1 | 33,333 | Hombres estudiantes (13-25 años) |
| 2 | 13,987 | Discapacitados motriz (13-70 años) |
| 3 | 25,000 | Mujeres profesionales (22-47 años) |
| 4 | 50,000 | Mexicanos activos (13-70 años) |
| 5 | 34,948 | Jóvenes sin discapacidad (18-25 años) |

### Tests NoSQL (Total: 156,189 usuarios)
| Test | Cantidad | Descripción |
|------|----------|-------------|
| 1 | 943 | Mujeres (22-47 años) |
| 2 | 40,000 | Sedentarios (13-70 años) |
| 3 | 28,500 | Sudamericanos (13-70 años) |
| 4 | 50,746 | Empleados (18-65 años) |
| 5 | 36,000 | Sin discapacidad (18-35 años) |
            `
        },
        servers: [
            { url: 'http://localhost:5000/api', description: 'Servidor local' }
        ]
    },
    apis: ['./API/routes/populate.routes.js']
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
