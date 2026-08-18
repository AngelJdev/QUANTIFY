import Habit from '../models/habit.model.js';
import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import UserMetric from '../models/userMetric.model.js';
import moment from 'moment';

/**
 * Catálogo Maestro de Logros de Quantify (25 logros)
 * Define todos los logros del sistema, sus requisitos, categorías y funciones evaluadoras.
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
            return count > 0;
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
            return user && (user.current_streak >= 3 || user.max_streak >= 3);
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
            return user && (user.current_streak >= 7 || user.max_streak >= 7);
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
            return user && (user.current_streak >= 21 || user.max_streak >= 21);
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
            return user && (user.current_streak >= 66 || user.max_streak >= 66);
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
            return user && (user.current_streak >= 100 || user.max_streak >= 100);
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
            const stepHabits = habits.filter(h => h.nombre.toLowerCase().includes('paso'));
            if (stepHabits.length === 0) return false;
            
            const weekAgo = moment().subtract(7, 'days').toDate();
            for (const h of stepHabits) {
                const count = await Log.countDocuments({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: weekAgo },
                    valor_registrado: { $gte: 10000 }
                });
                if (count >= 7) return true;
            }
            return false;
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
                return n.includes('cardio') || n.includes('bici') || n.includes('correr') || n.includes('cycling');
            });
            if (cardioHabits.length === 0) return false;

            const weekAgo = moment().subtract(7, 'days').toDate();
            for (const h of cardioHabits) {
                const count = await Log.countDocuments({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: weekAgo },
                    completado: true
                });
                if (count >= 3) return true;
            }
            return false;
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
                return n.includes('fuerza') || n.includes('pesas') || n.includes('gym');
            });
            if (gymHabits.length === 0) return false;

            const threeWeeksAgo = moment().subtract(21, 'days').toDate();
            for (const h of gymHabits) {
                const logs = await Log.find({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: threeWeeksAgo },
                    valor_registrado: { $ne: null }
                }).sort({ fecha_registro: 1 });

                if (logs.length >= 6) {
                    const values = logs.map(l => l.valor_registrado);
                    const isProgressing = values.slice(1).every((val, i) => val >= values[i]);
                    if (isProgressing && values[values.length - 1] > values[0]) return true;
                }
            }
            return false;
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
                return n.includes('sueño') || n.includes('dormir');
            });
            if (sleepHabits.length === 0) return false;

            const tenDaysAgo = moment().subtract(10, 'days').toDate();
            for (const h of sleepHabits) {
                const count = await Log.countDocuments({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: tenDaysAgo },
                    valor_registrado: { $gte: 7 }
                });
                if (count >= 10) return true;
            }
            return false;
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
                return n.includes('agua') || n.includes('hidrat');
            });
            if (waterHabits.length === 0) return false;

            const startOfMonth = moment().startOf('month').toDate();
            for (const h of waterHabits) {
                const logs = await Log.find({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: startOfMonth }
                });
                const daysInMonthSoFar = Math.max(1, moment().date());
                const completedCount = logs.filter(l => l.completado).length;
                if ((completedCount / daysInMonthSoFar) >= 0.9) return true;
            }
            return false;
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

            const startOfWeek = moment().startOf('week').toDate();
            let totalHours = 0;
            for (const h of habits) {
                const logs = await Log.find({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: startOfWeek }
                });
                totalHours += logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            }
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
            return user && (user.smartwatch_connected || user.smartwatch_id);
        }
    },

    // ─── NUEVOS 10 LOGROS AÑADIDOS ───────────────────────────────────────────
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
            const habits = await Habit.findAll({ where: { usuario_id: userId } });
            if (habits.length === 0) return false;
            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const logs = await Log.find({
                usuario_id: userId,
                fecha_registro: { $gte: startOfDay, $lte: endOfDay },
                completado: true
            });
            return logs.length >= habits.length;
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
            const count = await Log.countDocuments({ usuario_id: userId });
            return count >= 10;
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
            const user = await User.findByPk(userId);
            return Boolean(user);
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
            const sleepHabits = habits.filter(h => h.nombre.toLowerCase().includes('sueño'));
            if (sleepHabits.length === 0) return false;
            const fiveDaysAgo = moment().subtract(5, 'days').toDate();
            for (const h of sleepHabits) {
                const count = await Log.countDocuments({
                    usuario_id: userId,
                    habito_id: h.id,
                    fecha_registro: { $gte: fiveDaysAgo },
                    valor_registrado: { $gte: 8 }
                });
                if (count >= 5) return true;
            }
            return false;
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
            return user && (user.smartwatch_connected || user.smartwatch_id);
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
            const stepHabits = habits.filter(h => h.nombre.toLowerCase().includes('paso'));
            if (stepHabits.length === 0) return false;
            let totalSteps = 0;
            for (const h of stepHabits) {
                const logs = await Log.find({ usuario_id: userId, habito_id: h.id });
                totalSteps += logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            }
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
            let totalHours = 0;
            for (const h of habits) {
                const logs = await Log.find({ usuario_id: userId, habito_id: h.id });
                totalHours += logs.reduce((acc, l) => acc + (l.valor_registrado || 0), 0);
            }
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
                return n.includes('medita') || n.includes('mindful') || n.includes('respir');
            });
            if (zenHabits.length === 0) return false;
            for (const h of zenHabits) {
                const count = await Log.countDocuments({ usuario_id: userId, habito_id: h.id, completado: true });
                if (count >= 14) return true;
            }
            return false;
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
            return Boolean(user);
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
    }
];
