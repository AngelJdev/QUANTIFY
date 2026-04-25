/**
 * QUANTIFY DB BACKUP MANAGER (Senior DBA Tool)
 * -------------------------------------------
 * Este script automatiza la generación de respaldos SQL utilizando mysqldump.
 * Proporciona trazabilidad mediante logs y organización por categorías.
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BACKUP_DIR = path.resolve(process.cwd(), 'SQL/infrastructure/backups');
const LOG_FILE = path.resolve(process.cwd(), 'SQL/infrastructure/docs/backup_history.log');

/**
 * Justificación Técnica:
 * Los respaldos automatizados son la última línea de defensa contra la corrupción de datos.
 * El uso de mysqldump garantiza la consistencia transaccional mediante el flag --single-transaction.
 */

const runBackup = (type = 'auto', scope = 'full') => {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `${scope}_${type}_${timestamp}.sql`;
    const folder = type === 'manual' ? 'manual' : 'auto';
    const outputPath = path.join(BACKUP_DIR, folder, filename);

    // Detección inteligente de mysqldump en Windows
    const commonPaths = [
        'mysqldump', // Intentar primero el global
        'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysqldump.exe',
        'C:\\xampp\\mysql\\bin\\mysqldump.exe',
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe'
    ];

    let mysqlDumpCmd = 'mysqldump';
    for (const p of commonPaths) {
        if (p === 'mysqldump') continue;
        if (fs.existsSync(p)) {
            mysqlDumpCmd = `"${p}"`;
            break;
        }
    }
    
    const dbName = process.env.MYSQL_DATABASE || 'quantify_db';
    const dbUser = process.env.MYSQL_USER || 'root';
    const dbPass = process.env.MYSQL_PASSWORD || '';
    const dbHost = process.env.MYSQL_HOST || 'localhost';

    let command = `${mysqlDumpCmd} -h ${dbHost} -u ${dbUser} ${dbPass ? `-p${dbPass}` : ''} --single-transaction --routines --triggers ${dbName}`;

    // Si es parcial, solo incluimos tablas críticas
    if (scope === 'partial') {
        const partialTables = 'Users UserMetrics Habits Achievements';
        command += ` ${partialTables}`;
    }

    command += ` > "${outputPath}"`;

    console.log(`Iniciando respaldo ${scope.toUpperCase()} (${type})...`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error en respaldo: ${error.message}`);
            return;
        }
        
        const logEntry = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] TYPE: ${type.toUpperCase()} | SCOPE: ${scope.toUpperCase()} | FILE: ${filename} | STATUS: SUCCESS | REASON: Routine maintenance and data integrity checkpoint.\n`;
        fs.appendFileSync(LOG_FILE, logEntry);
        
        console.log(`Respaldo completado: ${outputPath}`);
    });
};

// Captura de argumentos CLI
const args = process.argv.slice(2);
const typeArg = args.includes('--manual') ? 'manual' : 'auto';
const scopeArg = args.includes('--partial') ? 'partial' : 'full';

runBackup(typeArg, scopeArg);
