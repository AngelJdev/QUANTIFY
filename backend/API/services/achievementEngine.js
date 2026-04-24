import Log from '../../SQL/models/log.model.js';
import Achievement from '../../SQL/models/achievement.model.js';
import Habit from '../../SQL/models/habit.model.js';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Motor de Inteligencia Quantify
 * Encargado de la lógica matemática de logros y recomendaciones biométricas.
 */
export const achievementEngine = {
    /**
     * Calcula la Tasa de Adherencia: (Días Cumplidos / Días Programados) * 100
     * @param {number} diasCumplidos 
     * @param {number} diasProgramados 
     * @returns {number}
     */
    calculateAdherenceRate: (diasCumplidos, diasProgramados) => {
        if (!diasProgramados || diasProgramados <= 0) return 0;
        return (diasCumplidos / diasProgramados) * 100;
    },

    /**
     * Evalúa si un usuario merece un logro mensual basado en su constancia (> 90%).
     */
    evaluateMonthlyConsistency: async (usuario_id, habito_id) => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const monthIndex = currentDate.getMonth();
        const mesLogroStr = `${MESES[monthIndex]} ${year}`;

        // Límites del mes actual
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        try {
            // 1. Evitar duplicados
            const hasAchievement = await Achievement.findOne({
                where: { usuario_id, titulo: `Guerrero de ${mesLogroStr}`, mes_logro: mesLogroStr }
            });
            if (hasAchievement) return { unlocked: false, reason: 'Already awarded' };

            // 2. Obtener racha y base de programación
            const habit = await Habit.findByPk(habito_id);
            if (!habit) return { unlocked: false, reason: 'Habit not found' };

            const logs = await Log.find({
                usuario_id,
                habito_id,
                fecha_registro: { $gte: startOfMonth, $lte: endOfMonth }
            });

            // Días Programados: El menor entre (días transcurridos del mes) y (días desde la creación del hábito en este mes)
            const creationDate = new Date(habit.fecha_creacion);
            const effectiveStartDate = creationDate > startOfMonth ? creationDate : startOfMonth;
            const diffTime = Math.abs(currentDate - effectiveStartDate);
            const diasProgramados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            const diasCumplidos = logs.filter(l => l.completado).length;
            const adherenceRate = achievementEngine.calculateAdherenceRate(diasCumplidos, diasProgramados);

            // 3. Umbral del 90%
            if (adherenceRate >= 90 && diasProgramados >= 7) { // Mínimo una semana de datos para otorgar medalla
                const newAchievement = await Achievement.create({
                    usuario_id,
                    titulo: `Guerrero de ${mesLogroStr}`,
                    descripcion: `Mantuvo una tasa de adherencia del ${adherenceRate.toFixed(1)}% durante ${mesLogroStr}.`,
                    mes_logro: mesLogroStr,
                    icono_url: '🏆'
                });
                return { unlocked: true, achievement: newAchievement };
            }

            return { unlocked: false, rate: adherenceRate };
        } catch (error) {
            console.error('Error in achievementEngine:', error);
            return { unlocked: false, error: true };
        }
    },

    /**
     * Genera recomendaciones dinámicas basadas en la edad y biometría (NSF Standards).
     */
    generateRecommendationsBasedOnMetrics: (metrics) => {
        const { edad, peso, nivel_actividad } = metrics;
        const recommendations = [];

        // Lógica de Sueño (National Sleep Foundation)
        let sleepHours = "7-9";
        let sleepReason = "Rango optimizado para salud cognitiva en adultos.";

        if (edad >= 6 && edad <= 13) { sleepHours = "9-11"; sleepReason = "Vital para desarrollo físico y hormonal."; }
        else if (edad >= 14 && edad <= 17) { sleepHours = "8-10"; sleepReason = "Necesario para consolidación de memoria adolescente."; }
        else if (edad >= 65) { sleepHours = "7-8"; sleepReason = "Rango preventivo para salud cardiovascular en adultos mayores."; }

        recommendations.push({
            nombre: 'Hábito de Sueño',
            meta_diaria: sleepHours.split('-')[1],
            unidad: 'Horas',
            descripcion: `Recomendación: ${sleepHours} horas. ${sleepReason}`
        });

        // Hidratación (Basado en peso y actividad)
        const baseWater = (peso * 0.035).toFixed(1); // 35ml por kg
        const extraWater = (nivel_actividad === 'ACTIVO' || nivel_actividad === 'MUY_ACTIVO') ? 0.7 : 0;
        const totalWater = (parseFloat(baseWater) + extraWater).toFixed(1);

        recommendations.push({
            nombre: 'Hidratación Quantify',
            meta_diaria: totalWater,
            unidad: 'Litros',
            descripcion: `Tu biotipo requiere ${totalWater}L para compensar tu nivel de actividad ${nivel_actividad.toLowerCase()}.`
        });

        return recommendations;
    }
};
