import UserMetric from '../models/userMetric.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { achievementEngine } from '../services/achievementEngine.js';

export const saveMetrics = async (req, res, next) => {
    try {
        const { edad, peso, estatura, genero, nivel_actividad, lfpdppp_agreed } = req.body;
        const usuario_id = req.user.id;

        if (!lfpdppp_agreed) {
            return sendError(res, 400, 'Debes aceptar el aviso de privacidad LFPDPPP.');
        }

        const existingMetrics = await UserMetric.findOne({ where: { usuario_id } });
        if (existingMetrics) {
            return sendError(res, 400, 'El usuario ya ha completado el Onboarding.');
        }

        const newMetrics = await UserMetric.create({
            usuario_id,
            edad,
            peso,
            estatura,
            genero,
            nivel_actividad
        });

        return sendSuccess(res, 201, 'Métricas guardadas exitosamente', {
            metrics: newMetrics
        });
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        const metrics = await UserMetric.findOne({ where: { usuario_id } });
        
        if (!metrics) {
            return sendSuccess(res, 200, 'Onboarding pendiente', { recommendations: [] });
        }

        const recommendations = achievementEngine.generateRecommendationsBasedOnMetrics(metrics);

        return sendSuccess(res, 200, 'Recomendaciones obtenidas', { recommendations });
    } catch (error) {
        next(error);
    }
};
