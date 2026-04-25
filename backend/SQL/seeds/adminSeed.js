/**
 * Admin Seed Script
 * Creates 4 administrator users on server startup if they don't already exist.
 * Each admin also gets a UserMetric record so they bypass onboarding.
 */
import User from '../models/user.model.js';
import UserMetric from '../models/userMetric.model.js';

const ADMIN_USERS = [
    { nombre: 'Farias',  username: 'farias',  email: 'farias@quantify.ai',  password: 'Admin@2025Farias',  securityPhrase: 'frase_segura_admin_farias_2025' },
    { nombre: 'Artiaga', username: 'artiaga', email: 'artiaga@quantify.ai', password: 'Admin@2025Artiaga', securityPhrase: 'frase_segura_admin_artiaga_2025' },
    { nombre: 'Angel',   username: 'angel',   email: 'angel@quantify.ai',   password: 'Admin@2025Angel',   securityPhrase: 'frase_segura_admin_angel_2025' },
    { nombre: 'Paco',    username: 'paco',    email: 'paco@quantify.ai',    password: 'Admin@2025Paco',    securityPhrase: 'frase_segura_admin_paco_2025' }
];

export const seedAdmins = async () => {
    try {
        for (const admin of ADMIN_USERS) {
            const [user, created] = await User.findOrCreate({
                where: { email: admin.email },
                defaults: {
                    nombre: admin.nombre,
                    username: admin.username,
                    email: admin.email,
                    password_hash: admin.password,
                    security_phrase_hash: admin.securityPhrase,
                    rol: 0,
                    pais: 'México'
                }
            });

            if (created) {
                // Create UserMetric so admin doesn't need onboarding
                await UserMetric.findOrCreate({
                    where: { usuario_id: user.id },
                    defaults: {
                        usuario_id: user.id,
                        edad: 25,
                        peso: 75.0,
                        estatura: 175,
                        genero: 'MASCULINO',
                        nivel_actividad: 'ACTIVO',
                        discapacidad: 'NINGUNA',
                        ocupacion: 'PROGRAMADOR'
                    }
                });
                console.log(`✅ Admin seed: ${admin.nombre} created (${admin.email})`);
            } else {
                console.log(`ℹ️  Admin seed: ${admin.nombre} already exists, skipping.`);
            }
        }
        console.log('✅ Admin seed completed.');
    } catch (error) {
        console.error('❌ Error seeding admin users:', error.message);
    }
};
