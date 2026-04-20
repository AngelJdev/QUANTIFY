/**
 * Calcula la tasa de adherencia de un hábito.
 * @param {number} diasCumplidos Número total de días en los que se alcanzó o registró un status exitoso
 * @param {number} diasProgramados Total de días en los que el hábito tuvo que realizarse en el rango evaluado
 * @returns {number} Porcentaje de adherencia 0-100
 */
export const calculateAdherence = (diasCumplidos, diasProgramados) => {
    if (diasProgramados === 0) return 0;
    return Math.round((diasCumplidos / diasProgramados) * 100);
};
