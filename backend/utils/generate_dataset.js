import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_SIZE = 10000;
const roles = [0, 1, 2]; // 0=ADMIN, 1=USER, 2=MODERADOR

const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getRandomDate = () => {
    const end = new Date();
    const start = new Date(end.getTime() - (365 * 24 * 60 * 60 * 1000));
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const users = [];

console.log(`Generando dataset de ${DATASET_SIZE} usuarios...`);

// Generamos un hash genérico (bcrypt) para ahorrar CPU durante la generación masiva
// Password base simulado: "Password123!"
const fakeHash = "$2a$10$wT3x9O0.5c.3G8.E/O1tI.Z1T6Z2B6Q2u1R1c4y8w9B7t2v1M3q3m"; 

for (let i = 1; i <= DATASET_SIZE; i++) {
    const current_streak = Math.floor(Math.random() * 30);
    const max_streak = current_streak + Math.floor(Math.random() * 50);
    
    users.push({
        nombre: `User_Sim_${generateRandomString(6)}`,
        email: `sim_${i}_${generateRandomString(4)}@ejemplo.com`,
        password_hash: fakeHash,
        rol: Math.random() > 0.95 ? 2 : 1, // 95% users, 5% mods
        preferencias: JSON.stringify({ theme: Math.random() > 0.5 ? 'dark' : 'light', notifications: true }),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=Sim${i}`,
        current_streak: current_streak,
        max_streak: max_streak,
        last_login_date: getRandomDate(),
        fecha_creacion: getRandomDate()
    });
}

// Forzamos que el primer usuario sea admin para pruebas si se requiere
users[0].rol = 0;
users[0].nombre = "Admin_Simulador";
users[0].email = "admin_sim@ejemplo.com";

const outputPath = path.join(__dirname, '..', 'users_dataset.json');

fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));

console.log(`Dataset de ${DATASET_SIZE} usuarios generado exitosamente en: ${outputPath}`);
