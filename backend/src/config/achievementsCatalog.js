import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import UserMetric from '../models/userMetric.model.js';
import ActiveSmartwatch from '../models/nosql/activeSmartwatch.nosql.js';
import WatchTelemetry from '../models/nosql/watchTelemetry.nosql.js';
import moment from 'moment';

/**
 * Catálogo Maestro de Logros de Quantify (25 logros)
 * Define todos los logros del sistema, sus requisitos, categorías y funciones evaluadoras reales.
 */
export const ACHIEVEMENTS_CATALOG = [
    {
        id: 'pionero_quantify',
        titulo: 'Pionero Quantify 🌟',
        descripcion: 'Has dado el primer paso en tu ingeniería personal configurando tu cuenta y creando tu primer hábito.',
        requisito: 'Configura tu perfil y crea al menos 1 hábito.',
        categoria: 'Plataforma',
        rareza: 'Común',
        icono_key: 'pionero',
        icono: '🌟',
        evaluate: async (userId) => {
            const count = await Habit.count({ where: { usuario_id: userId } });
            return count >= 1;
        }
    },
    {
        id: 'chispa_inicial',
        titulo: 'Chispa Inicial 🔥',
        descripcion: 'Primeros 3 días consecutivos de racha. ¡El motor de tu constancia ha arrancado!',
        requisito: '3 días consecutivos de racha actitudinal.',
        categoria: 'Constancia',
        rareza: 'Común',
        icono_key: 'chispa',
        icono: '⚡',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            return Boolean(user && (user.current_streak >= 3 || user.max_streak >= 3));
        }
    },
    {
        id: 'racha_estelar_7',
        titulo: 'Racha Estelar ⭐',
        descripcion: 'Una semana entera manteniendo el foco e impulsando tus objetivos diarios.',
        requisito: '7 días consecutivos de racha.',
        categoria: 'Constancia',
        rareza: 'Raro',
        icono_key: 'estelar',
        icono: '⭐',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            return Boolean(user && (user.current_streak >= 7 || user.max_streak >= 7));
        }
    },
    {
        id: 'habito_forjado',
        titulo: 'Hábito Forjado ⛓️',
        descripcion: '21 días de constancia ininterrumpida. La neurociencia confirma que la rutina ha comenzado a enraizarse.',
        requisito: '21 días consecutivos de racha.',
        categoria: 'Constancia',
        rareza: 'Épico',
        icono_key: 'forjado',
        icono: '🔗',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            return Boolean(user && (user.current_streak >= 21 || user.max_streak >= 21));
        }
    },
    {
        id: 'imparable',
        titulo: 'Imparable 🚀',
        descripcion: 'Has alcanzado los 66 días de racha. ¡Tus hábitos son ahora automáticos y parte integral de tu ADN!',
        requisito: '66 días continuos de racha.',
        categoria: 'Constancia',
        rareza: 'Legendario',
        icono_key: 'imparable',
        icono: '🛸',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            return Boolean(user && (user.current_streak >= 66 || user.max_streak >= 66));
        }
    },
    {
        id: 'leyenda_viviente',
        titulo: 'Leyenda Viviente 👑',
        descripcion: '100 días de racha inquebrantable. Perteneces al 1% de usuarios con disciplina de nivel élite.',
        requisito: '100 días consecutivos de racha.',
        categoria: 'Constancia',
        rareza: 'Legendario',
        icono_key: 'leyenda',
        icono: '👑',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            return Boolean(user && (user.current_streak >= 100 || user.max_streak >= 100));
        }
    },
    {
        id: 'caminante_incansable',
        titulo: 'Caminante Incansable 👟',
        descripcion: 'Superaste la barrera de los 10,000 pasos diarios durante una semana completa.',
        requisito: '10,000 pasos diarios × 7 días seguidos.',
        categoria: 'Salud',
        rareza: 'Raro',
        icono_key: 'caminante',
        icono: '🏃',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const stepHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('paso') || n.includes('caminar') || n.includes('walk') || n.includes('step');
            });
            if (stepHabits.length === 0) return false;

            const habitIds = stepHabits.map(h => h.id);
            const weekAgo = moment().subtract(7, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: weekAgo },
                valor_registrado: { $gte: 10000 }
            });

            const distinctDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            return distinctDays.size >= 7;
        }
    },
    {
        id: 'cadencia_perfecta',
        titulo: 'Cadencia Perfecta 🚴',
        descripcion: 'Demostraste alto rendimiento cardiovascular completando 3 o más sesiones de cardio en una sola semana.',
        requisito: '3 sesiones de cardio intenso en 7 días.',
        categoria: 'Salud',
        rareza: 'Raro',
        icono_key: 'cadencia',
        icono: '🚵',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const cardioHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('cardio') || n.includes('bici') || n.includes('correr') || n.includes('cycling') || n.includes('runner') || n.includes('corredor');
            });
            if (cardioHabits.length === 0) return false;

            const habitIds = cardioHabits.map(h => h.id);
            const weekAgo = moment().subtract(7, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: weekAgo },
                completado: true
            });

            const distinctDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            return distinctDays.size >= 3;
        }
    },
    {
        id: 'sobrecarga_progresiva',
        titulo: 'Sobrecarga Progresiva 🦍',
        descripcion: 'Aumentaste tus pesos y volumen de fuerza sostenidamente durante 3 semanas consecutivas.',
        requisito: 'Tendencia de fuerza creciente durante 3 semanas.',
        categoria: 'Salud',
        rareza: 'Legendario',
        icono_key: 'sobrecarga',
        icono: '🦾',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const gymHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('fuerza') || n.includes('pesas') || n.includes('gym') || n.includes('musculo') || n.includes('workout');
            });
            if (gymHabits.length === 0) return false;

            const habitIds = gymHabits.map(h => h.id);
            const threeWeeksAgo = moment().subtract(21, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: threeWeeksAgo },
                valor_registrado: { $ne: null, $gt: 0 }
            }).sort({ fecha_registro: 1 });

            if (logs.length < 3) return false;

            const week1 = logs.filter(l => moment(l.fecha_registro).isBefore(moment().subtract(14, 'days')));
            const week2 = logs.filter(l => moment(l.fecha_registro).isBetween(moment().subtract(14, 'days'), moment().subtract(7, 'days')));
            const week3 = logs.filter(l => moment(l.fecha_registro).isSameOrAfter(moment().subtract(7, 'days')));

            if (week1.length === 0 || week2.length === 0 || week3.length === 0) return false;

            const avg1 = week1.reduce((sum, l) => sum + l.valor_registrado, 0) / week1.length;
            const avg2 = week2.reduce((sum, l) => sum + l.valor_registrado, 0) / week2.length;
            const avg3 = week3.reduce((sum, l) => sum + l.valor_registrado, 0) / week3.length;

            return avg1 < avg2 && avg2 < avg3;
        }
    },
    {
        id: 'reloj_biologico',
        titulo: 'Reloj Biológico 🌙',
        descripcion: 'Mantuviste una rutina de descanso reparador alineada a tus requerimientos fisiológicos por 10 días.',
        requisito: 'Horas de sueño recomendadas × 10 días seguidos.',
        categoria: 'Bienestar',
        rareza: 'Épico',
        icono_key: 'biologico',
        icono: '😴',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const sleepHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('sueño') || n.includes('dormir') || n.includes('sleep') || n.includes('descanso');
            });
            if (sleepHabits.length === 0) return false;

            const habitIds = sleepHabits.map(h => h.id);
            const rangeStart = moment().subtract(14, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: rangeStart },
                valor_registrado: { $gte: 7 }
            });

            const distinctDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            return distinctDays.size >= 10;
        }
    },
    {
        id: 'oasis_hidratacion',
        titulo: 'Oasis de Hidratación 💧',
        descripcion: 'Cumpliste con tu meta personalizada de consumo de agua con más del 90% de adherencia mensual.',
        requisito: 'Adherencia >90% en consumo de agua en el mes.',
        categoria: 'Bienestar',
        rareza: 'Épico',
        icono_key: 'oasis',
        icono: '💧',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const waterHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('agua') || n.includes('hidrat') || n.includes('water');
            });
            if (waterHabits.length === 0) return false;

            const habitIds = waterHabits.map(h => h.id);
            const startOfMonth = moment().startOf('month').toDate();
            const daysInMonthSoFar = Math.max(1, moment().date());

            if (daysInMonthSoFar < 7) return false;

            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: startOfMonth },
                completado: true
            });

            const distinctCompletedDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            const adherenceRate = (distinctCompletedDays.size / daysInMonthSoFar) * 100;
            return adherenceRate >= 90 && distinctCompletedDays.size >= 7;
        }
    },
    {
        id: 'estado_flujo',
        titulo: 'Estado de Flujo 🧠',
        descripcion: 'Acumulaste más de 20 horas de trabajo profundo o estudio enfocado en una sola semana.',
        requisito: '20+ horas de enfoque profundo en 1 semana.',
        categoria: 'Productividad',
        rareza: 'Legendario',
        icono_key: 'flujo',
        icono: '⚛️',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId, tipo_medicion: 'TIEMPO' } });
            if (habits.length === 0) return false;

            const habitIds = habits.map(h => h.id);
            const startOfWeek = moment().subtract(7, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: startOfWeek }
            });

            const totalHours = logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            return totalHours >= 20;
        }
    },
    {
        id: 'alquimista_datos',
        titulo: 'Alquimista de Datos 📊',
        descripcion: 'Has alimentado el algoritmo de Quantify registrando más de 15 entradas o métricas biométricas.',
        requisito: 'Registrar 15 o más logs en la plataforma.',
        categoria: 'Plataforma',
        rareza: 'Raro',
        icono_key: 'alquimista',
        icono: '📊',
        evaluate: async (userId) => {
            const count = await Log.countDocuments({ usuario_id: userId });
            return count >= 15;
        }
    },
    {
        id: 'arquitecto_habitos',
        titulo: 'Arquitecto de Hábitos 🏗️',
        descripcion: 'Has diseñado un ecosistema estructurado creando 5 o más hábitos simultáneos.',
        requisito: 'Mantener 5 o más hábitos creados.',
        categoria: 'Productividad',
        rareza: 'Común',
        icono_key: 'arquitecto',
        icono: '🏗️',
        evaluate: async (userId) => {
            const count = await Habit.count({ where: { usuario_id: userId } });
            return count >= 5;
        }
    },
    {
        id: 'sincronizacion_total',
        titulo: 'Sincronización Total ⌚',
        descripcion: 'Conectaste tu reloj inteligente a Quantify para la extracción bio-métrica automatizada.',
        requisito: 'Vincular y sincronizar un Smartwatch.',
        categoria: 'Smartwatch',
        rareza: 'Épico',
        icono_key: 'sincronizacion',
        icono: '⌚',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            const activeSmartwatch = await ActiveSmartwatch.findOne({ usuario_id: userId });
            return Boolean(user && (user.smartwatch_connected || user.smartwatch_id || activeSmartwatch));
        }
    },
    {
        id: 'maestro_rutina',
        titulo: 'Maestro de la Rutina 🎯',
        descripcion: 'Lograste cumplir el 100% de todos tus hábitos programados en un solo día.',
        requisito: 'Completar 100% de hábitos en un día.',
        categoria: 'Constancia',
        rareza: 'Épico',
        icono_key: 'rutina',
        icono: '🎯',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId, activo: true } });
            if (habits.length === 0) return false;

            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();

            const habitIds = habits.map(h => h.id);
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: startOfDay, $lte: endOfDay },
                completado: true
            });

            const completedHabitIds = new Set(logs.map(l => l.habito_id));
            return habits.every(h => completedHabitIds.has(h.id));
        }
    },
    {
        id: 'guerrero_finsemana',
        titulo: 'Guerrero de Fin de Semana 🛡️',
        descripcion: 'No bajaste la guardia durante el fin de semana y mantuviste tus hábitos activos.',
        requisito: 'Registrar hábitos activos en Sábado y Domingo.',
        categoria: 'Constancia',
        rareza: 'Raro',
        icono_key: 'finsemana',
        icono: '🛡️',
        evaluate: async (userId) => {
            const twoWeeksAgo = moment().subtract(14, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                fecha_registro: { $gte: twoWeeksAgo },
                completado: true
            });

            let hasSaturday = false;
            let hasSunday = false;

            logs.forEach(l => {
                const day = moment(l.fecha_registro).day();
                if (day === 6) hasSaturday = true;
                if (day === 0) hasSunday = true;
            });

            return hasSaturday && hasSunday;
        }
    },
    {
        id: 'madrugador_disciplinado',
        titulo: 'Madrugador Disciplinado 🌅',
        descripcion: 'Demostraste determinación registrando o completando tu primer hábito antes de las 8:00 AM.',
        requisito: 'Registrar un hábito antes de las 8:00 AM.',
        categoria: 'Productividad',
        rareza: 'Raro',
        icono_key: 'madrugador',
        icono: '🌅',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            for (const h of habits) {
                const hourCreated = moment(h.fecha_creacion).hour();
                if (hourCreated >= 5 && hourCreated < 8) return true;
            }

            const logs = await Log.find({ usuario_id: userId, completado: true });
            for (const l of logs) {
                const logHour = moment(l.fecha_registro).hour();
                if (logHour >= 5 && logHour < 8) return true;
            }

            return false;
        }
    },
    {
        id: 'guardian_nocturno',
        titulo: 'Guardián Nocturno 🌌',
        descripcion: 'Priorizaste tu recuperación cognitiva durmiendo 8 o más horas durante 5 días seguidos.',
        requisito: 'Dormir 8+ horas durante 5 días seguidos.',
        categoria: 'Bienestar',
        rareza: 'Raro',
        icono_key: 'nocturno',
        icono: '🌌',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const sleepHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('sueño') || n.includes('dormir') || n.includes('sleep');
            });
            if (sleepHabits.length === 0) return false;

            const habitIds = sleepHabits.map(h => h.id);
            const rangeStart = moment().subtract(14, 'days').startOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                fecha_registro: { $gte: rangeStart },
                valor_registrado: { $gte: 8 }
            });

            const distinctDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            return distinctDays.size >= 5;
        }
    },
    {
        id: 'corazon_hierro',
        titulo: 'Corazón de Hierro ❤️',
        descripcion: 'Mantuviste lecturas óptimas de frecuencia cardíaca dentro de rango de salud registradas por 7 días.',
        requisito: 'Monitoreo constante de ritmo cardíaco por 7 días.',
        categoria: 'Salud',
        rareza: 'Épico',
        icono_key: 'corazon',
        icono: '❤️',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            const activeSmartwatch = await ActiveSmartwatch.findOne({ usuario_id: userId });
            if (!user || (!user.smartwatch_connected && !user.smartwatch_id && !activeSmartwatch)) {
                return false;
            }

            const telemetry = await WatchTelemetry.find({
                usuario_id: userId,
                avg_bpm: { $gt: 0 }
            });

            const distinctDays = new Set(telemetry.map(t => moment(t.start_time || t.createdAt).format('YYYY-MM-DD')));
            return distinctDays.size >= 7;
        }
    },
    {
        id: 'maraton_biometrico',
        titulo: 'Maratón Biométrico 🏅',
        descripcion: 'Has acumulado la impresionante cifra de 100,000 pasos en total en Quantify.',
        requisito: 'Acumular 100,000 pasos en total.',
        categoria: 'Salud',
        rareza: 'Legendario',
        icono_key: 'maraton',
        icono: '🏅',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const stepHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('paso') || n.includes('caminar') || n.includes('walk') || n.includes('step');
            });
            if (stepHabits.length === 0) return false;

            const habitIds = stepHabits.map(h => h.id);
            const logs = await Log.find({ usuario_id: userId, habito_id: { $in: habitIds } });
            const totalSteps = logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            return totalSteps >= 100000;
        }
    },
    {
        id: 'maestro_tiempo',
        titulo: 'Maestro del Tiempo ⏱️',
        descripcion: 'Invertiste más de 50 horas de trabajo y desarrollo personal en hábitos de tiempo.',
        requisito: '50+ horas acumuladas en hábitos de tiempo.',
        categoria: 'Productividad',
        rareza: 'Épico',
        icono_key: 'tiempo',
        icono: '⏱️',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId, tipo_medicion: 'TIEMPO' } });
            if (habits.length === 0) return false;

            const habitIds = habits.map(h => h.id);
            const logs = await Log.find({ usuario_id: userId, habito_id: { $in: habitIds } });
            const totalHours = logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            return totalHours >= 50;
        }
    },
    {
        id: 'zen_absoluto',
        titulo: 'Zen Absoluto 🧘',
        descripcion: 'Completaste 14 días acumulados dedicados a la meditación, respiración o mindfulness.',
        requisito: '14 días acumulados en hábitos de meditación/mindfulness.',
        categoria: 'Bienestar',
        rareza: 'Épico',
        icono_key: 'zen',
        icono: '🧘',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            const zenHabits = habits.filter(h => {
                const n = h.nombre.toLowerCase();
                return n.includes('medita') || n.includes('mindful') || n.includes('respir') || n.includes('zen') || n.includes('yoga');
            });
            if (zenHabits.length === 0) return false;

            const habitIds = zenHabits.map(h => h.id);
            const logs = await Log.find({
                usuario_id: userId,
                habito_id: { $in: habitIds },
                completado: true
            });

            const distinctDays = new Set(logs.map(l => moment(l.fecha_registro).format('YYYY-MM-DD')));
            return distinctDays.size >= 14;
        }
    },
    {
        id: 'comunidad_activa',
        titulo: 'Comunidad Activa 👥',
        descripcion: 'Te conectaste con el soporte técnico o participaste activamente en la comunidad Quantify.',
        requisito: 'Acceder y consultar soporte o comunidad.',
        categoria: 'Plataforma',
        rareza: 'Común',
        icono_key: 'comunidad',
        icono: '👥',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            const prefs = user.preferencias || {};
            return Boolean(prefs.has_contacted_support || prefs.community_accessed);
        }
    },
    {
        id: 'ingeniero_vida',
        titulo: 'Ingeniero de Vida 🦾',
        descripcion: 'Alcanzaste 50 o más logs totales registrados e impresores 30 días de racha máxima en la app.',
        requisito: '50 logs totales + 30 días de racha máxima.',
        categoria: 'Plataforma',
        rareza: 'Legendario',
        icono_key: 'ingeniero',
        icono: '🦾',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user || user.max_streak < 30) return false;
            const count = await Log.countDocuments({ usuario_id: userId });
            return count >= 50;
        }
    },
    // ─── NUEVOS LOGROS DEL ECOSISTEMA Y PLATAFORMA (32 en total) ──────────────────────
    {
        id: 'ecosistema_completo',
        titulo: 'Ecosistema Completo 🌐',
        descripcion: 'Sincronizaste tu cuenta en todo el ecosistema Quantify: Web/Móvil, Smartwatch y Smart TV.',
        requisito: 'Vincular Web/Móvil, Smartwatch y Smart TV.',
        categoria: 'Plataforma',
        rareza: 'Legendario',
        icono_key: 'ecosistema',
        icono: '🌐',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            const prefs = user.preferencias || {};
            const activeSmartwatch = await ActiveSmartwatch.findOne({ usuario_id: userId });
            const hasWatch = Boolean(user.smartwatch_connected || user.smartwatch_id || activeSmartwatch);
            const hasTV = Boolean(prefs.smarttv_connected || prefs.smarttv_accessed);
            return hasWatch && hasTV;
        }
    },
    {
        id: 'vision_gran_pantalla',
        titulo: 'Visión Gran Pantalla 📺',
        descripcion: 'Visualizaste tu tablero de hábitos en gran formato accediendo desde tu Smart TV.',
        requisito: 'Iniciar sesión o consultar hábitos en la Smart TV.',
        categoria: 'Smart TV',
        rareza: 'Épico',
        icono_key: 'pantalla',
        icono: '📺',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            const prefs = user.preferencias || {};
            return Boolean(prefs.smarttv_connected || prefs.smarttv_accessed);
        }
    },
    {
        id: 'trio_en_accion',
        titulo: 'Trío en Acción ⌚📺',
        descripcion: 'Completaste un hábito desde tu Smartwatch y monitoreaste tu progreso en la Smart TV el mismo día.',
        requisito: 'Registrar hábito en Smartwatch y consultar Smart TV hoy.',
        categoria: 'Ecosistema',
        rareza: 'Legendario',
        icono_key: 'trio',
        icono: '⚡',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            const prefs = user.preferencias || {};
            const hasTVToday = Boolean(prefs.smarttv_last_access_today);
            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const watchLogToday = await Log.findOne({
                usuario_id: userId,
                fecha_registro: { $gte: startOfDay, $lte: endOfDay },
                notas: { $regex: /smartwatch/i }
            });
            return Boolean(hasTVToday && watchLogToday);
        }
    },
    {
        id: 'inteligencia_cuantica',
        titulo: 'Inteligencia Cuántica 🤖',
        descripcion: 'Potencias tu ingeniería personal consultando recomendaciones del Quantify Intelligence Agent.',
        requisito: 'Consultar y recibir una sugerencia de la IA.',
        categoria: 'Productividad',
        rareza: 'Raro',
        icono_key: 'inteligencia',
        icono: '🤖',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            const prefs = user.preferencias || {};
            return Boolean(prefs.used_ai || prefs.ai_consulted);
        }
    },
    {
        id: 'biotelemetria_total',
        titulo: 'Bio-Telemetría Total 📈',
        descripcion: 'Perfil biológico completo con edad, peso, estatura, nivel de actividad y telemetría de pulso cardíaco.',
        requisito: 'Completar biometría y registrar pulso cardíaco.',
        categoria: 'Salud',
        rareza: 'Épico',
        icono_key: 'telemetria',
        icono: '📈',
        evaluate: async (userId) => {
            const metric = await UserMetric.findOne({ where: { usuario_id: userId } });
            if (!metric || !metric.peso || !metric.estatura || !metric.edad || !metric.nivel_actividad) return false;
            const telemetry = await WatchTelemetry.findOne({ usuario_id: userId, avg_bpm: { $gt: 0 } });
            return Boolean(telemetry);
        }
    },
    {
        id: 'perfil_alta_precision',
        titulo: 'Perfil de Alta Precisión 👤',
        descripcion: 'Perfeccionaste tu cuenta completando tu información de perfil, avatar y configuración.',
        requisito: 'Completar perfil, avatar y preferencias.',
        categoria: 'Plataforma',
        rareza: 'Común',
        icono_key: 'perfil',
        icono: '👤',
        evaluate: async (userId) => {
            const user = await User.findByPk(userId);
            if (!user) return false;
            return Boolean(user.nombre && user.email && user.avatar_url && user.preferencias);
        }
    },
    {
        id: 'dominio_holistico',
        titulo: 'Dominio Holístico 🎨',
        descripcion: 'Mantienes un estilo de vida integral con hábitos activos en Salud, Bienestar y Productividad.',
        requisito: 'Mantener hábitos en Salud, Bienestar y Productividad.',
        categoria: 'Productividad',
        rareza: 'Épico',
        icono_key: 'holistico',
        icono: '🎨',
        evaluate: async (userId) => {
            const habits = await Habit.findAll({ where: { usuario_id: userId, activo: true } });
            if (habits.length < 3) return false;
            let hasSalud = false;
            let hasBienestar = false;
            let hasProductividad = false;
            habits.forEach(h => {
                const n = h.nombre.toLowerCase();
                if (n.includes('paso') || n.includes('cardio') || n.includes('fuerza') || n.includes('pesas') || n.includes('gym') || n.includes('correr')) hasSalud = true;
                if (n.includes('sueño') || n.includes('agua') || n.includes('medita') || n.includes('zen') || n.includes('respir')) hasBienestar = true;
                if (h.tipo_medicion === 'TIEMPO' || n.includes('estudio') || n.includes('lectura') || n.includes('trabajo') || n.includes('enfoque')) hasProductividad = true;
            });
            return hasSalud && hasBienestar && hasProductividad;
        }
    }
];
