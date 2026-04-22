import User from './src/models/user.model.js';
import UserMetric from './src/models/userMetric.model.js';
import Habit from './src/models/habit.model.js';
import Log from './src/models/log.model.js';
import Achievement from './src/models/achievement.model.js';
import sequelize from './src/config/db.mysql.js';
import { connectMongo } from './src/config/db.mongo.js';
import mongoose from 'mongoose';

async function seed() {
    try {
        console.log('--- Iniciando Inyección de Datos (v3) ---');
        
        await connectMongo();
        
        // 1. Admin Tester
        const [admin] = await User.findOrCreate({
            where: { email: 'admin_tester@quantify.ai' },
            defaults: {
                nombre: 'Admin Tester',
                password_hash: 'admin123',
                rol: 'ADMIN',
                current_streak: 20,
                max_streak: 45,
                last_login_date: new Date().toISOString().split('T')[0]
            }
        });

        // Limpieza profunda para este usuario específico para evitar conflictos de duplicados
        await UserMetric.destroy({ where: { usuario_id: admin.id } });
        const existingHabits = await Habit.findAll({ where: { usuario_id: admin.id } });
        for (const h of existingHabits) {
            await Log.deleteMany({ habito_id: h.id });
        }
        await Habit.destroy({ where: { usuario_id: admin.id } });
        await Achievement.destroy({ where: { usuario_id: admin.id } });

        // 2. Métricas
        await UserMetric.create({
            usuario_id: admin.id,
            edad: 28,
            peso: 75.0,
            estatura: 175,
            genero: 'MASCULINO',
            nivel_actividad: 'MODERADO'
        });

        // 3. Hábito (Retrocedemos la fecha de creación para que la adherencia sea lógica)
        const creationDate = new Date();
        creationDate.setDate(creationDate.getDate() - 35);

        const habit = await Habit.create({
            usuario_id: admin.id,
            nombre: 'Meditación Matutina',
            frecuencia: 'DIARIO',
            meta_diaria: 10,
            unidad: 'MINUTOS',
            tipo_medicion: 'NUMERICO',
            fecha_creacion: creationDate
        });

        // 4. Logs (79% Adherencia)
        const logs = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const isCompleted = i % 4 !== 0; // Aproximadamente 75-80%
            
            logs.push({
                habito_id: habit.id,
                usuario_id: admin.id,
                fecha_registro: date,
                completado: isCompleted,
                valor_registrado: isCompleted ? 10 : 0
            });
        }
        await Log.insertMany(logs);

        // 5. Logros exclusivos
        await Achievement.bulkCreate([
            {
                usuario_id: admin.id,
                titulo: 'Arquitecto de Hábitos 🏗️',
                descripcion: 'Has configurado tu primer sistema de ingeniería personal.',
                mes_logro: 'Abril',
                icono_url: '🏗️'
            },
            {
                usuario_id: admin.id,
                titulo: 'Fuego Eterno 🔥',
                descripcion: 'Has mantenido una racha de más de 15 días.',
                mes_logro: 'Abril',
                icono_url: '🔥'
            },
            {
                usuario_id: admin.id,
                titulo: 'Alquimista de Datos ⚗️',
                descripcion: 'Has procesado más de 30 registros bio-sincrónicos.',
                mes_logro: 'Abril',
                icono_url: '⚗️'
            }
        ]);

        console.log('--- Inyección v3 Completada ---');
        console.log('Login: admin_tester@quantify.ai / admin123');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error en seed v3:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
}

seed();
