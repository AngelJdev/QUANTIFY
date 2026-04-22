/**
 * Calcula la Tasa de Adherencia Histórica de un hábito específico.
 * Fórmula: (Días Cumplidos / Días Programados desde creación) * 100
 * 
 * @param {number} diasCumplidos - Número de días en los que se completó el hábito
 * @param {number} diasProgramados - Días transcurridos desde la creación del hábito
 * @returns {number} - Porcentaje entero (0-100)
 */
export const calculateAdherence = (diasCumplidos, diasProgramados) => {
    if (!diasProgramados || diasProgramados <= 0) return 0;
    return Math.min(100, Math.round((diasCumplidos / diasProgramados) * 100));
};

/**
 * Calcula la Adherencia Global Diaria: cuántos hábitos completó el usuario HOY.
 * Fórmula: totalHabitos === 0 ? 0 : Math.round((completadosHoy / totalHabitos) * 100)
 * 
 * @param {number} completadosHoy - Hábitos marcados como completados hoy
 * @param {number} totalHabitos - Total de hábitos activos del usuario
 * @returns {number} - Porcentaje entero (0-100), nunca divide entre cero
 */
export const calculateDailyCompletion = (completadosHoy, totalHabitos) => {
    if (totalHabitos === 0) return 0;
    return Math.min(100, Math.round((completadosHoy / totalHabitos) * 100));
};
