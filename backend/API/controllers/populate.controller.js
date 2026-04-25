/**
 * Populate Controller - Handles population and cleanup for SQL and NoSQL tests.
 */
import { populateSQL, deletePopulatedSQL } from '../../SQL/populate/sqlPopulator.js';
import { populateNoSQL, deletePopulatedNoSQL } from '../../NoSQL/populate/nosqlPopulator.js';
import Bitacora from '../../SQL/models/bitacora.model.js';
import MongoBitacora from '../../NoSQL/models/bitacora.nosql.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// ─── Helper: get client IP ───
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.connection?.remoteAddress
        || req.ip
        || '0.0.0.0';
}

// ─── Helper: build description for Bitacora ───
function buildDescription(type, result, config) {
    const parts = [];
    if (config.genero) parts.push(`genero=${config.genero}`);
    if (config.ocupacion) parts.push(`ocupacion=${config.ocupacion}`);
    if (config.ocupaciones) parts.push(`ocupaciones=[${config.ocupaciones.join(',')}]`);
    if (config.pais) parts.push(`pais=${config.pais}`);
    if (config.paises) parts.push(`paises=[${config.paises.join(',')}]`);
    if (config.discapacidad) parts.push(`discapacidad=${config.discapacidad}`);
    if (config.nivel_actividad) parts.push(`nivel_actividad=${config.nivel_actividad}`);
    if (config.edad_min != null) parts.push(`edad_min=${config.edad_min}`);
    if (config.edad_max != null) parts.push(`edad_max=${config.edad_max}`);
    const configStr = parts.length > 0 ? ` | Filtros: ${parts.join(', ')}` : ' | Sin filtros (todo aleatorio)';
    return `Población ${type}: ${result.inserted} usuarios insertados${configStr}`;
}

// ─── POST /api/populate/sql ───
export const populateSQLHandler = async (req, res, next) => {
    try {
        const config = req.body;

        if (!config.cantidad || config.cantidad < 1) {
            return sendError(res, 400, 'El campo "cantidad" es obligatorio y debe ser mayor a 0.');
        }
        if (config.edad_min != null && (config.edad_min < 13 || config.edad_min > 70)) {
            return sendError(res, 400, 'edad_min debe estar entre 13 y 70.');
        }
        if (config.edad_max != null && (config.edad_max < 13 || config.edad_max > 70)) {
            return sendError(res, 400, 'edad_max debe estar entre 13 y 70.');
        }
        if (config.edad_min != null && config.edad_max != null && config.edad_min > config.edad_max) {
            return sendError(res, 400, 'edad_min no puede ser mayor que edad_max.');
        }

        console.log(`\n🔵 [SQL] Iniciando población: ${config.cantidad} usuarios...`);
        const result = await populateSQL(config);

        const ip = getClientIP(req);
        const descripcion = buildDescription('SQL', result, config);
        await Bitacora.create({ operacion: 'INSERT', ip, descripcion });

        console.log(`✅ [SQL] Población completada: ${result.inserted} usuarios en ${result.timeSeconds}s\n`);

        return sendSuccess(res, 201, `Población SQL completada: ${result.inserted} usuarios insertados en ${result.timeSeconds}s`, {
            inserted: result.inserted,
            timeSeconds: result.timeSeconds,
            database: 'MySQL + MongoDB (sync)'
        });
    } catch (error) {
        console.error('❌ [SQL] Error en población:', error.message);
        next(error);
    }
};

// ─── DELETE /api/populate/sql ───
export const deleteSQLHandler = async (req, res, next) => {
    try {
        console.log('\n🔴 [SQL] Iniciando limpieza de datos poblados...');
        const result = await deletePopulatedSQL();

        const ip = getClientIP(req);
        await Bitacora.create({
            operacion: 'DELETE',
            ip,
            descripcion: `Limpieza SQL: ${result.deleted} usuarios poblados eliminados.`
        });

        console.log(`✅ [SQL] Limpieza completada: ${result.deleted} usuarios eliminados en ${result.timeSeconds}s\n`);

        return sendSuccess(res, 200, `Limpieza SQL completada: ${result.deleted} usuarios eliminados en ${result.timeSeconds}s`, {
            deleted: result.deleted,
            timeSeconds: result.timeSeconds
        });
    } catch (error) {
        console.error('❌ [SQL] Error en limpieza:', error.message);
        next(error);
    }
};

// ─── POST /api/populate/nosql ───
export const populateNoSQLHandler = async (req, res, next) => {
    try {
        const config = req.body;

        if (!config.cantidad || config.cantidad < 1) {
            return sendError(res, 400, 'El campo "cantidad" es obligatorio y debe ser mayor a 0.');
        }
        if (config.edad_min != null && (config.edad_min < 13 || config.edad_min > 70)) {
            return sendError(res, 400, 'edad_min debe estar entre 13 y 70.');
        }
        if (config.edad_max != null && (config.edad_max < 13 || config.edad_max > 70)) {
            return sendError(res, 400, 'edad_max debe estar entre 13 y 70.');
        }
        if (config.edad_min != null && config.edad_max != null && config.edad_min > config.edad_max) {
            return sendError(res, 400, 'edad_min no puede ser mayor que edad_max.');
        }

        console.log(`\n🟢 [NoSQL] Iniciando población: ${config.cantidad} usuarios...`);
        const result = await populateNoSQL(config);

        const ip = getClientIP(req);
        const descripcion = buildDescription('NoSQL', result, config);
        await MongoBitacora.create({ operacion: 'INSERT', ip, descripcion });

        console.log(`✅ [NoSQL] Población completada: ${result.inserted} usuarios en ${result.timeSeconds}s\n`);

        return sendSuccess(res, 201, `Población NoSQL completada: ${result.inserted} usuarios insertados en ${result.timeSeconds}s`, {
            inserted: result.inserted,
            timeSeconds: result.timeSeconds,
            database: 'MongoDB (directo)'
        });
    } catch (error) {
        console.error('❌ [NoSQL] Error en población:', error.message);
        next(error);
    }
};

// ─── DELETE /api/populate/nosql ───
export const deleteNoSQLHandler = async (req, res, next) => {
    try {
        console.log('\n🔴 [NoSQL] Iniciando limpieza de datos poblados...');
        const result = await deletePopulatedNoSQL();

        const ip = getClientIP(req);
        await MongoBitacora.create({
            operacion: 'DELETE',
            ip,
            descripcion: `Limpieza NoSQL: ${result.deleted} usuarios poblados eliminados.`
        });

        console.log(`✅ [NoSQL] Limpieza completada: ${result.deleted} usuarios eliminados en ${result.timeSeconds}s\n`);

        return sendSuccess(res, 200, `Limpieza NoSQL completada: ${result.deleted} usuarios eliminados en ${result.timeSeconds}s`, {
            deleted: result.deleted,
            timeSeconds: result.timeSeconds
        });
    } catch (error) {
        console.error('❌ [NoSQL] Error en limpieza:', error.message);
        next(error);
    }
};
