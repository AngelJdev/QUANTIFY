/**
 * QUANTIFY DB HEALTH MONITOR (Senior DBA Monitoring Tool)
 * ------------------------------------------------------
 * Este script genera indicadores de rendimiento y salud de la base de datos.
 * Fulfills the 'Mecanismo de Monitoreo' requirement.
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function checkDatabaseHealth() {
    console.log('Iniciando monitoreo de salud de la base de datos...\n');

    try {
        // 1. Prueba de Latencia de Conexión
        const start = Date.now();
        await sequelize.authenticate();
        const latency = Date.now() - start;
        console.log(`Conexión: ESTABLE (Latencia: ${latency}ms)`);

        // 2. Monitoreo de Tamaño de Tablas (Indicadores de Carga)
        const [tableSizes] = await sequelize.query(`
            SELECT table_name AS "Tabla", 
                   ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Tamaño (MB)",
                   table_rows AS "Registros"
            FROM information_schema.TABLES 
            WHERE table_schema = '${process.env.MYSQL_DATABASE}'
        `);
        console.log('\nIndicadores de Carga:');
        console.table(tableSizes);

        // 3. Monitoreo de Seguridad (Trazabilidad de Auditoría)
        const [[auditCount]] = await sequelize.query('SELECT COUNT(*) as total FROM SecurityAuditLogs');
        console.log(`\nMonitoreo de Seguridad:`);
        console.log(`- Registros en Bitácora de Auditoría: ${auditCount.total}`);

        // 4. Verificación de Integridad de Rachas (Data Quality)
        const [[rachaAnomala]] = await sequelize.query('SELECT COUNT(*) as total FROM Users WHERE current_streak > max_streak');
        if (rachaAnomala.total > 0) {
            console.warn(`\nALERTA DE CALIDAD: Se detectaron ${rachaAnomala.total} usuarios con inconsistencia en rachas.`);
        } else {
            console.log(`\nCalidad de Datos: SIN ANOMALÍAS DETECTADAS.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('\nERROR CRÍTICO EN MONITOREO:', error.message);
        process.exit(1);
    }
}

checkDatabaseHealth();
