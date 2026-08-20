import User from '../models/user.model.js';
import Achievement from '../models/achievement.model.js';
import UserMetric from '../models/userMetric.model.js';
import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import { ACHIEVEMENTS_CATALOG } from '../config/achievementsCatalog.js';
import moment from 'moment';

/**
 * Motor de Gamificación Avanzado de Quantify
 * Analiza hitos, biometría y tendencias para otorgar logros.
 */
export const analyzeAchievements = async (userId, habitoId, logValue) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return;

        // Evaluar catálogo maestro para otorgar logros meritorios
        for (const item of ACHIEVEMENTS_CATALOG) {
            try {
                if (item.evaluate) {
                    const isEligible = await item.evaluate(userId);
                    if (isEligible) {
                        await awardAchievement(userId, item.titulo, item.descripcion, item.icono_key || item.icono);
                    }
                }
            } catch (err) {
                console.error(`Error evaluando ${item.id} en analyzeAchievements:`, err);
            }
        }
    } catch (error) {
        console.error('Error in analyzeAchievements:', error);
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
 * Función que se ejecuta al login
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

    // Evaluar logros de catálogo tras actualizar racha
    for (const item of ACHIEVEMENTS_CATALOG) {
        if (item.id.includes('racha') || item.id === 'chispa_inicial' || item.id === 'imparable' || item.id === 'leyenda_viviente' || item.id === 'habito_forjado') {
            const isEligible = await item.evaluate(user.id);
            if (isEligible) {
                await awardAchievement(user.id, item.titulo, item.descripcion, item.icono_key || item.icono);
            }
        }
    }

    return user;
};
