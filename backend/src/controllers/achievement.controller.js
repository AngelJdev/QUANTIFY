import Achievement from '../models/achievement.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAchievements = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        const achievements = await Achievement.findAll({
            where: { usuario_id },
            order: [['fecha_obtencion', 'DESC']]
        });

        return sendSuccess(res, 200, 'Logros recuperados', { 
            achievements,
            total: achievements.length
        });
    } catch (error) {
        next(error);
    }
};

export const awardAchievement = async (usuario_id, titulo, descripcion, icono) => {
    try {
        const [achievement, created] = await Achievement.findOrCreate({
            where: { usuario_id: usuario_id, titulo },
            defaults: {
                descripcion,
                mes_logro: new Date().toLocaleString('es-MX', { month: 'long' }),
                icono_url: icono
            }
        });
    } catch (error) {
        console.error('Error awarding achievement:', error);
    }
};
