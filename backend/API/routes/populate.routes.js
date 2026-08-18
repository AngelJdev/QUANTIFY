import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import {
    populateSQLHandler,
    deleteSQLHandler,
    populateNoSQLHandler,
    deleteNoSQLHandler
} from '../controllers/populate.controller.js';

const router = Router();

// Proteger todas las rutas de población: requiere token y rol ADMIN (0)
router.use(verifyToken);
router.use(isAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     PopulateRequest:
 *       type: object
 *       required:
 *         - cantidad
 *       properties:
 *         cantidad:
 *           type: integer
 *           description: Número de usuarios a insertar (obligatorio)
 *           example: 33333
 *         edad_min:
 *           type: integer
 *           minimum: 13
 *           maximum: 70
 *           nullable: true
 *           description: "Edad mínima. null = se infiere por ocupación o default 13"
 *         edad_max:
 *           type: integer
 *           minimum: 13
 *           maximum: 70
 *           nullable: true
 *           description: "Edad máxima. null = se infiere por ocupación o default 70"
 *         genero:
 *           type: string
 *           nullable: true
 *           enum: [MASCULINO, FEMENINO, OTRO]
 *           description: "null = aleatorio (48% M, 48% F, 4% Otro)"
 *         nivel_actividad:
 *           type: string
 *           nullable: true
 *           enum: [SEDENTARIO, LIGERO, MODERADO, ACTIVO, MUY_ACTIVO]
 *           description: "null = aleatorio"
 *         pais:
 *           type: string
 *           nullable: true
 *           enum: [México, Estados Unidos, Colombia, Argentina, España, Chile, Perú, Brasil, Ecuador, Venezuela, Guatemala, Cuba, Bolivia, Rep. Dominicana, Honduras, Paraguay, El Salvador, Costa Rica, Panamá, Uruguay]
 *           description: "País fijo. null = aleatorio"
 *         paises:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: "Array de países para elegir aleatoriamente. Prioridad sobre pais."
 *         discapacidad:
 *           type: string
 *           nullable: true
 *           enum: [NINGUNA, MOTRIZ, VISUAL, AUDITIVA, INTELECTUAL, PSICOSOCIAL, DEL_HABLA, MULTIPLE]
 *           description: "null = aleatorio (75% NINGUNA)"
 *         ocupacion:
 *           type: string
 *           nullable: true
 *           enum: [ESTUDIANTE, EMPLEADO, FREELANCE, EMPRESARIO, DESEMPLEADO, JUBILADO, DOCENTE, MEDICO, INGENIERO, ABOGADO, CONTADOR, DISEÑADOR, PROGRAMADOR, COMERCIANTE, AGRICULTOR, ARTISTA, DEPORTISTA, INVESTIGADOR, AMA_DE_CASA, OTRO]
 *           description: "Ocupación fija. Si se especifica, el rango de edad se ajusta automáticamente. null = aleatorio"
 *         ocupaciones:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: "Array de ocupaciones para elegir aleatoriamente. Prioridad sobre ocupacion."
 *         peso:
 *           type: number
 *           nullable: true
 *           description: "Peso fijo en kg. null = auto-generado por correlación edad/género"
 *         estatura:
 *           type: integer
 *           nullable: true
 *           description: "Estatura fija en cm. null = auto-generado por correlación edad/género"
 *     PopulateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             inserted:
 *               type: integer
 *             timeSeconds:
 *               type: string
 *             database:
 *               type: string
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             deleted:
 *               type: integer
 *             timeSeconds:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   - name: "Población SQL"
 *     description: "Endpoints para poblar y limpiar usuarios en MySQL (con sincronización automática a MongoDB)"
 *   - name: "Población NoSQL"
 *     description: "Endpoints para poblar y limpiar usuarios directamente en MongoDB (sin tocar MySQL)"
 */

/**
 * @swagger
 * /populate/sql:
 *   post:
 *     summary: Poblar usuarios en MySQL
 *     description: |
 *       Inserta N usuarios en MySQL y sincroniza automáticamente a MongoDB.
 *       Solo "cantidad" es obligatorio. Los demás campos son opcionales:
 *       - Si se especifican, TODOS los usuarios generados tendrán ese valor.
 *       - Si son null o se omiten, se generan aleatoriamente respetando reglas de negocio.
 *       - Si se especifica una ocupación, el rango de edad se ajusta automáticamente (ej: ESTUDIANTE → 13-25 años).
 *       
 *       **Tests predefinidos SQL (Total: 157,268):**
 *       - Test 1: 33,333 hombres estudiantes
 *       - Test 2: 13,987 discapacitados motriz
 *       - Test 3: 25,000 mujeres profesionales (22-47 años)
 *       - Test 4: 50,000 mexicanos activos
 *       - Test 5: 34,948 jóvenes sin discapacidad (18-25 años)
 *     tags: [Población SQL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PopulateRequest'
 *           examples:
 *             test1:
 *               summary: "SQL Test 1 — 33,333 hombres estudiantes"
 *               value:
 *                 cantidad: 33333
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: "MASCULINO"
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: "ESTUDIANTE"
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test2:
 *               summary: "SQL Test 2 — 13,987 discapacitados motriz"
 *               value:
 *                 cantidad: 13987
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: null
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: "MOTRIZ"
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test3:
 *               summary: "SQL Test 3 — 25,000 mujeres profesionales (22-47)"
 *               value:
 *                 cantidad: 25000
 *                 edad_min: 22
 *                 edad_max: 47
 *                 genero: "FEMENINO"
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: null
 *                 ocupaciones: ["MEDICO","INGENIERO","ABOGADO","CONTADOR","DOCENTE","INVESTIGADOR"]
 *                 peso: null
 *                 estatura: null
 *             test4:
 *               summary: "SQL Test 4 — 50,000 mexicanos activos"
 *               value:
 *                 cantidad: 50000
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: null
 *                 nivel_actividad: "ACTIVO"
 *                 pais: "México"
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test5:
 *               summary: "SQL Test 5 — 34,948 jóvenes sin discapacidad (18-25)"
 *               value:
 *                 cantidad: 34948
 *                 edad_min: 18
 *                 edad_max: 25
 *                 genero: null
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: "NINGUNA"
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *     responses:
 *       201:
 *         description: Población exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopulateResponse'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/sql', populateSQLHandler);

/**
 * @swagger
 * /populate/sql:
 *   delete:
 *     summary: Eliminar todos los usuarios poblados de MySQL
 *     description: |
 *       Elimina todos los usuarios con email @quantify-pop.test de MySQL y su espejo en MongoDB.
 *       Los usuarios reales y administradores NO se ven afectados.
 *     tags: [Población SQL]
 *     responses:
 *       200:
 *         description: Limpieza exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 */
router.delete('/sql', deleteSQLHandler);

/**
 * @swagger
 * /populate/nosql:
 *   post:
 *     summary: Poblar usuarios directamente en MongoDB
 *     description: |
 *       Inserta N usuarios directamente en MongoDB SIN pasar por MySQL.
 *       Demuestra la capacidad independiente del motor NoSQL.
 *       Solo "cantidad" es obligatorio. Los demás campos son opcionales.
 *       
 *       **Tests predefinidos NoSQL (Total: 156,189):**
 *       - Test 1: 943 mujeres (22-47 años)
 *       - Test 2: 40,000 sedentarios
 *       - Test 3: 28,500 sudamericanos
 *       - Test 4: 50,746 empleados
 *       - Test 5: 36,000 sin discapacidad (18-35 años)
 *     tags: [Población NoSQL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PopulateRequest'
 *           examples:
 *             test1:
 *               summary: "NoSQL Test 1 — 943 mujeres (22-47)"
 *               value:
 *                 cantidad: 943
 *                 edad_min: 22
 *                 edad_max: 47
 *                 genero: "FEMENINO"
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test2:
 *               summary: "NoSQL Test 2 — 40,000 sedentarios"
 *               value:
 *                 cantidad: 40000
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: null
 *                 nivel_actividad: "SEDENTARIO"
 *                 pais: null
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test3:
 *               summary: "NoSQL Test 3 — 28,500 sudamericanos"
 *               value:
 *                 cantidad: 28500
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: null
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: ["Colombia","Argentina","Chile","Perú","Brasil","Ecuador","Venezuela","Bolivia","Paraguay","Uruguay"]
 *                 discapacidad: null
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test4:
 *               summary: "NoSQL Test 4 — 50,746 empleados"
 *               value:
 *                 cantidad: 50746
 *                 edad_min: null
 *                 edad_max: null
 *                 genero: null
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: null
 *                 ocupacion: "EMPLEADO"
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *             test5:
 *               summary: "NoSQL Test 5 — 36,000 sin discapacidad (18-35)"
 *               value:
 *                 cantidad: 36000
 *                 edad_min: 18
 *                 edad_max: 35
 *                 genero: null
 *                 nivel_actividad: null
 *                 pais: null
 *                 paises: null
 *                 discapacidad: "NINGUNA"
 *                 ocupacion: null
 *                 ocupaciones: null
 *                 peso: null
 *                 estatura: null
 *     responses:
 *       201:
 *         description: Población exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopulateResponse'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/nosql', populateNoSQLHandler);

/**
 * @swagger
 * /populate/nosql:
 *   delete:
 *     summary: Eliminar todos los usuarios poblados de MongoDB
 *     description: |
 *       Elimina todos los usuarios NoSQL poblados (prefijo nosql_ en email).
 *       Los usuarios sincronizados desde MySQL NO se ven afectados.
 *     tags: [Población NoSQL]
 *     responses:
 *       200:
 *         description: Limpieza exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 */
router.delete('/nosql', deleteNoSQLHandler);

export default router;
