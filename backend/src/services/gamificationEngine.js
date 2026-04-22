import User from '../models/user.model.js';
import Achievement from '../models/achievement.model.js';
import UserMetric from '../models/userMetric.model.js';
import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import { Op } from 'sequelize';
import moment from 'moment';

/**
 * Motor de Gamificación Avanzado de Quantify
 * Analiza hitos, biometría y tendencias para otorgar logros.
 */
export const analyzeAchievements = async (userId, habitoId, logValue) => {
    try {
        const user = await User.findByPk(userId);
        const habit = await Habit.findByPk(habitoId);
        if (!user || !habit) return;

        // 1. Logros de Constancia (Rachas de Login)
        await checkStreakMilestones(user);

        // 2. Logros Físicos (Pasos, Fuerza, Cardio)
        await checkPhysicalAchievements(userId, habit, logValue);

        // 3. Logros de Bienestar (Sueño vs Métricas)
        await checkWellnessAchievements(userId, habit, logValue);

        // 4. Logros de Productividad (Acumulación de tiempo)
        await checkProductivityAchievements(userId, habit);

    } catch (error) {
        console.error('Error in analyzeAchievements:', error);
    }
};

/**
 * Detecta hitos de racha de login
 */
const checkStreakMilestones = async (user) => {
    const streak = user.current_streak;
    
    if (streak >= 66) {
        await awardAchievement(user.id, 'Imparable 🚀', 'Has alcanzado los 66 días de racha. ¡Tus hábitos son ahora parte de tu ADN!', '🛸');
    } else if (streak >= 21) {
        await awardAchievement(user.id, 'Hábito Forjado ⛓️', '21 días de constancia ininterrumpida. El hábito ya está enraizado.', '🔗');
    } else if (streak >= 3) {
        await awardAchievement(user.id, 'Chispa Inicial 🔥', 'Primeros 3 días de racha. ¡El motor ha arrancado!', '⚡');
    }
};

/**
 * Analiza rendimiento físico
 */
const checkPhysicalAchievements = async (userId, habit, logValue) => {
    const nombre = habit.nombre.toLowerCase();

    // Caminante Incansable (Steps)
    if (nombre.includes('pasos') && logValue >= 10000) {
        const weekAgo = moment().subtract(7, 'days').toDate();
        const logs = await Log.find({
            usuario_id: userId,
            habito_id: habit.id,
            fecha_registro: { $gte: weekAgo },
            valor_registrado: { $gte: 10000 }
        });
        if (logs.length >= 7) {
            await awardAchievement(userId, 'Caminante Incansable 👟', 'Superaste los 10,000 pasos diarios durante una semana completa.', '🏃');
        }
    }

    // Cadencia Perfecta (Cardio)
    if (nombre.includes('cardio') || nombre.includes('cycling') || nombre.includes('bici')) {
        const startOfWeek = moment().startOf('week').toDate();
        const logsCount = await Log.countDocuments({
            usuario_id: userId,
            habito_id: habit.id,
            fecha_registro: { $gte: startOfWeek },
            completado: true
        });
        if (logsCount >= 3) {
            await awardAchievement(userId, 'Cadencia Perfecta 🚴', 'Completaste 3 o más sesiones de cardio intenso en una sola semana.', '🚵');
        }
    }

    // Sobrecarga Progresiva (Fuerza) - Análisis de tendencia de 3 semanas
    if (nombre.includes('fuerza') || nombre.includes('pesas') || nombre.includes('gym')) {
        const threeWeeksAgo = moment().subtract(21, 'days').toDate();
        const logs = await Log.find({
            usuario_id: userId,
            habito_id: habit.id,
            fecha_registro: { $gte: threeWeeksAgo },
            valor_registrado: { $ne: null }
        }).sort({ fecha_registro: 1 });

        if (logs.length >= 6) { // Mínimo 2 registros por semana
            const values = logs.map(l => l.valor_registrado);
            const isProgressing = values.slice(1).every((val, i) => val >= values[i]);
            if (isProgressing && values[values.length - 1] > values[0]) {
                await awardAchievement(userId, 'Sobrecarga Progresiva 🦍', 'Has aumentado tu fuerza de forma constante durante 3 semanas.', '🦾');
            }
        }
    }
};

/**
 * Bienestar basado en Biometría
 */
const checkWellnessAchievements = async (userId, habit, logValue) => {
    const nombre = habit.nombre.toLowerCase();

    if (nombre.includes('sueño') || nombre.includes('dormir')) {
        const metrics = await UserMetric.findOne({ where: { usuario_id: userId } });
        if (!metrics) return;

        let target = 7; // Default
        if (metrics.edad <= 13) target = 9;
        else if (metrics.edad <= 17) target = 8;
        else if (metrics.edad >= 65) target = 7;

        if (logValue >= target) {
            const tenDaysAgo = moment().subtract(10, 'days').toDate();
            const logs = await Log.countDocuments({
                usuario_id: userId,
                habito_id: habit.id,
                fecha_registro: { $gte: tenDaysAgo },
                valor_registrado: { $gte: target }
            });
            if (logs >= 10) {
                await awardAchievement(userId, 'Reloj Biológico 🌙', 'Mantuviste tu racha de sueño reparador según tu biotipo durante 10 días.', '😴');
            }
        }
    }
};

/**
 * Productividad acumulada
 */
const checkProductivityAchievements = async (userId, habit) => {
    if (habit.tipo_medicion === 'TIEMPO') {
        const startOfWeek = moment().startOf('week').toDate();
        const logs = await Log.find({
            usuario_id: userId,
            habito_id: habit.id,
            fecha_registro: { $gte: startOfWeek }
        });

        const totalHours = logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
        if (totalHours >= 20) {
            await awardAchievement(userId, 'Estado de Flujo 🧠', 'Has dedicado más de 20 horas de enfoque profundo esta semana.', '⚛️');
        }
    }
};

/**
 * Función auxiliar para otorgar logros sin duplicados
 */
export const awardAchievement = async (userId, titulo, descripcion, icono) => {
    try {
        const [achievement, created] = await Achievement.findOrCreate({
            where: { usuario_id: userId, titulo },
            defaults: {
                descripcion,
                mes_logro: moment().format('MMMM YYYY'),
                icono_url: icono
            }
        });
        return { achievement, created };
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return null;
    }
};

/**
 * Función que se ejecuta al login (heredada de v1)
 */
export const processUserGamification = async (user) => {
    const today = moment().format('YYYY-MM-DD');
    const lastLogin = user.last_login_date;
    let updatedFields = {};

    if (!lastLogin) {
        updatedFields = { current_streak: 1, max_streak: 1, last_login_date: today };
    } else {
        const diffDays = moment(today).diff(moment(lastLogin), 'days');
        if (diffDays === 1) {
            const newStreak = user.current_streak + 1;
            updatedFields = { current_streak: newStreak, max_streak: Math.max(user.max_streak, newStreak), last_login_date: today };
        } else if (diffDays > 1) {
            updatedFields = { current_streak: 1, last_login_date: today };
        } else {
            return user;
        }
    }

    await user.update(updatedFields);
    await checkStreakMilestones(user);
    return user;
};
