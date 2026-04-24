import Log from '../../SQL/models/log.model.js';
import Habit from '../../SQL/models/habit.model.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { calculateAdherence, calculateDailyCompletion } from '../../utils/metrics.js';
import { achievementEngine } from '../services/achievementEngine.js';
import { analyzeAchievements } from '../services/gamificationEngine.js';
import moment from 'moment';

export const createLog = async (req, res, next) => {
    try {
        const { habito_id, fecha_registro, completado, valor_registrado, notas } = req.body;
        
        // Verificar existencia y propiedad
        const habit = await Habit.findOne({ where: { id: habito_id, usuario_id: req.user.id } });
        if (!habit) {
            return sendError(res, 404, 'Hábito no encontrado');
        }

        // Buscar si ya existe un log para esa fecha y ese hábito
        // Usamos moment para asilar solo YYYY-MM-DD o manejar formato ISO si es necesario
        // En una app más robusta se puede usar timezone, aquí asumiremos exact match
        const startOfDay = new Date(fecha_registro);
        startOfDay.setUTCHours(0,0,0,0);
        const endOfDay = new Date(fecha_registro);
        endOfDay.setUTCHours(23,59,59,999);

        let log = await Log.findOne({
            habito_id,
            usuario_id: req.user.id,
            fecha_registro: { $gte: startOfDay, $lt: endOfDay }
        });

        if (log) {
            // Actualizar el existente (upsert-like behavior)
            log.completado = completado !== undefined ? completado : log.completado;
            log.valor_registrado = valor_registrado !== undefined ? valor_registrado : log.valor_registrado;
            log.notas = notas || log.notas;
            await log.save();
        } else {
            // Crear nuevo
            log = await Log.create({
                habito_id,
                usuario_id: req.user.id,
                fecha_registro: startOfDay,
                completado,
                valor_registrado,
                notas
            });
        }

        // Motor de Inteligencia Quantify: Analizar rachas, biometría y logros específicos
        // Se ejecuta de forma asíncrona para no bloquear la respuesta
        analyzeAchievements(req.user.id, habito_id, valor_registrado || (completado ? 1 : 0)).catch(console.error);

        // Motor de Logros Mensuales (Legacy Support)
        const achievementInfo = await achievementEngine.evaluateMonthlyConsistency(req.user.id, habito_id);

        return sendSuccess(res, 201, 'Registro guardado', {
            log,
            unlockedAchievement: achievementInfo.unlocked ? achievementInfo.achievement : null
        });
    } catch (error) {
        next(error);
    }
};

export const getLogsByHabit = async (req, res, next) => {
    try {
        const habito_id = req.params.habitId;
        const logs = await Log.find({ habito_id, usuario_id: req.user.id })
            .sort({ fecha_registro: -1 })
            .limit(30); // Últimos 30 logs
            
        return sendSuccess(res, 200, 'Registros recuperados', logs);
    } catch (error) {
        next(error);
    }
};

export const getAdherenceStats = async (req, res, next) => {
    try {
        const habito_id = req.params.habitId;
        
        const habit = await Habit.findOne({ where: { id: habito_id, usuario_id: req.user.id } });
        if (!habit) return sendError(res, 404, 'Hábito no encontrado');

        // Para simplificar MVP, calculamos sobre los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await Log.find({
            habito_id,
            usuario_id: req.user.id,
            fecha_registro: { $gte: thirtyDaysAgo }
        }).sort({ fecha_registro: 1 }); // Cronológico

        // Calcular días programados reales desde la creación del hábito
        const originDate = new Date(habit.fecha_creacion);
        const now = new Date();
        const diffTime = Math.abs(now - originDate);
        let diasProgramados = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diasProgramados === 0) diasProgramados = 1; // Al menos 1 día si acaba de ser creado
        if (diasProgramados > 30) diasProgramados = 30; // Scope máximo de esta tabla de analítica

        const diasCumplidos = logs.filter(l => l.completado).length;

        // Adherencia Histórica: usa días reales desde creación (sin piso artificial)
        const adherenceScore = calculateAdherence(diasCumplidos, diasProgramados);

        // Preparamos datos continuos para Recharts (Últimos 7 días) asegurando un Path contiguo
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const logForDay = logs.find(l => l.fecha_registro.toISOString().split('T')[0] === dateStr);
            
            chartData.push({
                fecha: dateStr,
                valor: logForDay ? (logForDay.valor_registrado || (logForDay.completado ? 1 : 0)) : 0,
                esfuerzo: logForDay && logForDay.completado ? 100 : 0
            });
        }

        // Análisis de Tendencias de Crecimiento (Semana actual vs Semana Pasada)
        const day7 = new Date(); day7.setDate(day7.getDate() - 7);
        const day14 = new Date(); day14.setDate(day14.getDate() - 14);

        const currentWeekSum = logs
            .filter(l => l.fecha_registro > day7)
            .reduce((acc, l) => acc + (l.valor_registrado || (l.completado ? 1 : 0)), 0);
            
        const previousWeekSum = logs
            .filter(l => l.fecha_registro > day14 && l.fecha_registro <= day7)
            .reduce((acc, l) => acc + (l.valor_registrado || (l.completado ? 1 : 0)), 0);

        let tendenciaSemanal = 0;
        if (previousWeekSum === 0) {
            tendenciaSemanal = currentWeekSum > 0 ? 100 : 0;
        } else {
            tendenciaSemanal = Math.round(((currentWeekSum - previousWeekSum) / previousWeekSum) * 100);
        }

        const isNewHabit = diasProgramados < 7;

        return sendSuccess(res, 200, 'Estadísticas de adherencia', {
            adherenceScore,
            diasCumplidos,
            diasProgramados,
            tendenciaSemanal,
            chartData,
            isNewHabit
        });
    } catch (error) {
        next(error);
    }
};

export const getGlobalStats = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        const habits = await Habit.findAll({ where: { usuario_id, activo: true } });
        
        if (habits.length === 0) {
            return sendSuccess(res, 200, 'Sin datos globales', { globalScore: 0, totalHabits: 0, dailyPerformance: [] });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setUTCHours(0,0,0,0);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Obtener todos los logs de todos los hábitos en el rango
        const allLogs = await Log.find({
            usuario_id,
            fecha_registro: { $gte: thirtyDaysAgo }
        }).sort({ fecha_registro: 1 });

        let totalAdherenceSum = 0;

        // 1. Calcular Score Global (Promedio de adherencias individuales)
        for (const habit of habits) {
            const habitLogs = allLogs.filter(l => l.habito_id === habit.id);
            const originDate = new Date(habit.fecha_creacion);
            const now = new Date();
            let diasProgramados = Math.ceil(Math.abs(now - originDate) / (1000 * 60 * 60 * 24));
            if (diasProgramados === 0) diasProgramados = 1;
            if (diasProgramados > 30) diasProgramados = 30;

            const diasCumplidos = habitLogs.filter(l => l.completado).length;
            totalAdherenceSum += calculateAdherence(diasCumplidos, diasProgramados);
        }

        // Completados HOY para la métrica de Adherencia Diaria
        const todayStr = new Date().toISOString().split('T')[0];
        const completadosHoy = allLogs.filter(l => {
            const d = new Date(l.fecha_registro);
            d.setUTCHours(0,0,0,0);
            return d.toISOString().split('T')[0] === todayStr && l.completado;
        }).length;
        const dailyCompletion = calculateDailyCompletion(completadosHoy, habits.length);

        // 2. Calcular Rendimiento Diario Agregado (Últimos 30 días)
        const dailyPerformance = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setUTCHours(0,0,0,0);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Hábitos que existían en esa fecha específica
            const activeOnDay = habits.filter(h => {
                const hDate = new Date(h.fecha_creacion);
                hDate.setUTCHours(0,0,0,0);
                return hDate <= d;
            });

            if (activeOnDay.length > 0) {
                const completedOnDay = allLogs.filter(l => {
                    const lDate = new Date(l.fecha_registro);
                    lDate.setUTCHours(0,0,0,0);
                    return lDate.toISOString().split('T')[0] === dateStr && l.completado;
                }).length;

                dailyPerformance.push({
                    fecha: dateStr,
                    completados: completedOnDay,
                    total: activeOnDay.length,
                    porcentaje: Math.round((completedOnDay / activeOnDay.length) * 100)
                });
            }
        }

        const globalScore = Math.round(totalAdherenceSum / habits.length);

        return sendSuccess(res, 200, 'Estadísticas globales recuperadas', {
            globalScore,
            dailyCompletion,
            totalHabits: habits.length,
            dailyPerformance
        });
    } catch (error) {
        next(error);
    }
};
