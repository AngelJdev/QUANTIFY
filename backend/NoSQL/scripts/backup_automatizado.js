/**
 * Script de Respaldo Automatizado - MongoDB (quantify_db)
 * 
 * Ejecuta mongodump automáticamente cada intervalo configurado.
 * Usa node-cron para programar la tarea.
 * 
 * REQUISITOS:
 *   - MongoDB Database Tools (mongodump) instalado y en PATH
 *   - npm install node-cron dotenv
 * 
 * USO:
 *   node backup_automatizado.js
 * 
 * CONFIGURACIÓN:
 *   Modifica CRON_SCHEDULE para ajustar la frecuencia.
 *   Por defecto: cada 6 horas.
 */

import cron from 'node-cron';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── CONFIGURACIÓN ───
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quantify_db';
const DB_NAME = 'quantify_db';
const BACKUP_BASE_DIR = path.resolve(__dirname, '../backups');
const MAX_BACKUPS = 10; // Mantener solo los últimos 10 respaldos automáticos

// Cada 6 horas: '0 */6 * * *'
// Cada 12 horas: '0 */12 * * *'
// Cada 24 horas (medianoche): '0 0 * * *'
const CRON_SCHEDULE = '0 */6 * * *';

// ─── FUNCIONES ───

function getTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}`;
}

function runBackup() {
    const timestamp = getTimestamp();
    const backupDir = path.join(BACKUP_BASE_DIR, `auto_${timestamp}`);

    // Crear directorio de respaldo
    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  RESPALDO AUTOMATIZADO - MongoDB`);
    console.log(`  Fecha: ${new Date().toLocaleString('es-MX')}`);
    console.log(`  Destino: ${backupDir}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        const cmd = `mongodump --uri="${MONGO_URI}" --out="${backupDir}" --db=${DB_NAME}`;
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\n✅ Respaldo automático completado: ${backupDir}`);
    } catch (error) {
        console.error(`\n❌ Error en respaldo automático: ${error.message}`);
        return;
    }

    // Limpiar respaldos antiguos (mantener solo MAX_BACKUPS)
    cleanOldBackups();
}

function cleanOldBackups() {
    try {
        const dirs = fs.readdirSync(BACKUP_BASE_DIR)
            .filter(d => d.startsWith('auto_'))
            .map(d => ({
                name: d,
                path: path.join(BACKUP_BASE_DIR, d),
                time: fs.statSync(path.join(BACKUP_BASE_DIR, d)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (dirs.length > MAX_BACKUPS) {
            const toDelete = dirs.slice(MAX_BACKUPS);
            toDelete.forEach(d => {
                fs.rmSync(d.path, { recursive: true, force: true });
                console.log(`🗑️  Respaldo antiguo eliminado: ${d.name}`);
            });
        }
    } catch (err) {
        console.error('Error limpiando respaldos antiguos:', err.message);
    }
}

// ─── INICIO ───

console.log(`\n${'='.repeat(60)}`);
console.log('  📦 Servicio de Respaldo Automatizado - MongoDB');
console.log(`  Programado: ${CRON_SCHEDULE}`);
console.log(`  Máximo de respaldos: ${MAX_BACKUPS}`);
console.log(`  Directorio: ${BACKUP_BASE_DIR}`);
console.log(`${'='.repeat(60)}\n`);

// Crear directorio base si no existe
fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });

// Ejecutar un respaldo inmediato al iniciar
console.log('🔄 Ejecutando respaldo inicial...');
runBackup();

// Programar respaldos automáticos
cron.schedule(CRON_SCHEDULE, () => {
    console.log('\n🔄 Ejecutando respaldo programado...');
    runBackup();
});

console.log('\n⏳ Servicio activo. Esperando siguiente ejecución programada...\n');
