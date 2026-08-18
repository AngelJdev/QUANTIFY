import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiStar, FiLock, FiRefreshCw, FiTarget, FiZap, 
    FiActivity, FiGrid, FiWatch, FiShield, FiAward 
} from 'react-icons/fi';
import {
    GiRocket, GiMedal, GiBrain, GiMoon,
    GiWaterDrop, GiDutchBike, GiRun, GiWeightLiftingUp, GiCrown, GiSparkles
} from 'react-icons/gi';
import api from '../services/api';

// ─── ICON MAP (react-icons/gi & fi) ──────────────────────────────
const ACHIEVEMENT_ICONS = {
    'pionero':       { Icon: GiSparkles,         color: '#fbbf24' },
    'chispa':        { Icon: FiZap,              color: '#f97316' },
    'estelar':       { Icon: FiStar,             color: '#eab308' },
    'forjado':       { Icon: GiWeightLiftingUp,  color: '#fbbf24' },
    'imparable':     { Icon: GiRocket,           color: '#a78bfa' },
    'leyenda':       { Icon: GiCrown,            color: '#fcd34d' },
    'caminante':     { Icon: GiRun,              color: '#34d399' },
    'cadencia':      { Icon: GiDutchBike,        color: '#38bdf8' },
    'sobrecarga':    { Icon: GiWeightLiftingUp,  color: '#f87171' },
    'biologico':     { Icon: GiMoon,             color: '#818cf8' },
    'biológico':     { Icon: GiMoon,             color: '#818cf8' },
    'oasis':         { Icon: GiWaterDrop,        color: '#22d3ee' },
    'flujo':         { Icon: GiBrain,            color: '#c084fc' },
    'alquimista':    { Icon: FiActivity,         color: '#2dd4bf' },
    'arquitecto':    { Icon: FiGrid,             color: '#60a5fa' },
    'sincronizacion':{ Icon: FiWatch,            color: '#c084fc' },
    'rutina':        { Icon: FiTarget,           color: '#34d399' },
    'finsemana':     { Icon: FiShield,           color: '#818cf8' },
    'madrugador':    { Icon: GiSparkles,         color: '#fbbf24' },
    'nocturno':      { Icon: GiMoon,             color: '#a78bfa' },
    'corazon':       { Icon: FiActivity,         color: '#f43f5e' },
    'maraton':       { Icon: GiRun,              color: '#f59e0b' },
    'tiempo':        { Icon: FiAward,            color: '#8b5cf6' },
    'zen':           { Icon: GiBrain,            color: '#34d399' },
    'comunidad':     { Icon: GiMedal,            color: '#38bdf8' },
    'ingeniero':     { Icon: GiCrown,            color: '#ec4899' },
    'default':       { Icon: GiMedal,            color: '#60a5fa' }
};

// ─── REQUIREMENTS MAP ─────────────────────────────────────────────────────
const ACHIEVEMENT_REQUIREMENTS = {
    'pionero':    'Configura tu perfil y crea al menos 1 hábito',
    'chispa':     '3 días consecutivos de racha',
    'forjado':    '21 días consecutivos de racha',
    'imparable':  '66 días continuos de racha',
    'caminante':  '10,000 pasos × 7 días seguidos',
    'sobrecarga': 'Tendencia de fuerza creciente × 3 semanas',
    'cadencia':   '3 sesiones de cardio en una semana',
    'biológico':  'Horas de sueño recomendadas × 10 días',
    'oasis':      'Adherencia >90% en hidratación al mes',
    'flujo':      '20+ horas de trabajo profundo en una semana',
    'arquitecto': 'Mantener 5 o más hábitos creados',
    'alquimista': 'Registrar 15 o más logs en la plataforma',
};

const getRequirement = (achievement) => {
    if (achievement?.requisito) return achievement.requisito;
    const titulo = (achievement?.titulo || (typeof achievement === 'string' ? achievement : '')).toLowerCase();
    const key = Object.keys(ACHIEVEMENT_REQUIREMENTS).find(k => titulo.includes(k));
    return key ? ACHIEVEMENT_REQUIREMENTS[key] : null;
};

const getIcon = (achievement) => {
    if (achievement?.icono_key && ACHIEVEMENT_ICONS[achievement.icono_key]) {
        return ACHIEVEMENT_ICONS[achievement.icono_key];
    }
    const titulo = (achievement?.titulo || (typeof achievement === 'string' ? achievement : '')).toLowerCase();
    const key = Object.keys(ACHIEVEMENT_ICONS).find(k => titulo.includes(k));
    return key ? ACHIEVEMENT_ICONS[key] : ACHIEVEMENT_ICONS['default'];
};

const getRarityStyle = (achievement) => {
    const rareza = achievement?.rareza || '';
    if (rareza === 'Legendario') {
        return { border: 'border-purple-400/30', gradient: 'from-purple-500 to-pink-500', badge: 'LEGENDARIO', badgeColor: 'text-purple-400 bg-purple-400/10', shadow: 'hover:shadow-purple-500/20' };
    }
    if (rareza === 'Épico') {
        return { border: 'border-amber-400/30', gradient: 'from-amber-400 to-orange-500', badge: 'ÉPICO', badgeColor: 'text-amber-400 bg-amber-400/10', shadow: 'hover:shadow-amber-500/20' };
    }
    if (rareza === 'Raro') {
        return { border: 'border-sky-400/30', gradient: 'from-sky-400 to-blue-500', badge: 'RARO', badgeColor: 'text-sky-400 bg-sky-400/10', shadow: 'hover:shadow-sky-500/20' };
    }
    const t = (achievement?.titulo || '').toLowerCase();
    if (t.includes('imparable') || t.includes('flujo') || t.includes('sobrecarga'))
        return { border: 'border-purple-400/30', gradient: 'from-purple-500 to-pink-500', badge: 'LEGENDARIO', badgeColor: 'text-purple-400 bg-purple-400/10', shadow: 'hover:shadow-purple-500/20' };
    if (t.includes('forjado') || t.includes('biológico') || t.includes('oasis'))
        return { border: 'border-amber-400/30', gradient: 'from-amber-400 to-orange-500', badge: 'ÉPICO', badgeColor: 'text-amber-400 bg-amber-400/10', shadow: 'hover:shadow-amber-500/20' };
    if (t.includes('cadencia') || t.includes('flujo') || t.includes('caminante'))
        return { border: 'border-sky-400/30', gradient: 'from-sky-400 to-blue-500', badge: 'RARO', badgeColor: 'text-sky-400 bg-sky-400/10', shadow: 'hover:shadow-sky-500/20' };
    return { border: 'border-accent/30', gradient: 'from-accent to-blue-500', badge: 'COMÚN', badgeColor: 'text-accent bg-accent/10', shadow: 'hover:shadow-accent/20' };
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const mockLogros = [
    { id: 1, titulo: 'Chispa Inicial', descripcion: 'Primeros 3 días de racha. ¡El motor ha arrancado!', mes_logro: 'Abril 2026', icono_key: 'chispa' },
    { id: 2, titulo: 'Racha Estelar 7', descripcion: 'Has mantenido el foco durante una semana completa.', mes_logro: 'Abril 2026', icono_key: 'estelar' },
    { id: 3, titulo: 'Alquimista de Datos', descripcion: 'Has procesado más de 30 registros bio-sincrónicos.', mes_logro: 'Abril 2026', icono_key: 'alquimista' },
    { id: 4, titulo: 'Arquitecto de Hábitos', descripcion: 'Has configurado tu primer sistema de ingeniería personal.', mes_logro: 'Abril 2026', icono_key: 'arquitecto' },
    { id: 5, titulo: 'Imparable', descripcion: 'Has alcanzado los 66 días de racha. ¡Tus hábitos son ahora parte de tu ADN!', mes_logro: 'Abril 2026', icono_key: 'imparable' },
    { id: 6, titulo: 'Hábito Forjado', descripcion: '21 días de constancia ininterrumpida. El hábito ya está enraizado.', mes_logro: 'Abril 2026', icono_key: 'forjado' },
];

const USE_MOCK = false; // Conectado a la API real de logros
// ──────────────────────────────────────────────────────────────────────────────

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09 } }
};

const cardVariant = {
    hidden: { y: 20, opacity: 0, scale: 0.93 },
    show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } }
};

export default function TrophyGallery({ refreshSignal }) {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAchievements = async () => {
        setLoading(true);
        setError(false);
        try {
            if (USE_MOCK) {
                await new Promise(r => setTimeout(r, 400));
                setAchievements(mockLogros);
            } else {
                const res = await api.get('/achievements');
                const data = res.data.data;
                if (data?.catalog) {
                    const unlocked = data.catalog.filter(a => a.unlocked);
                    setAchievements(unlocked.length > 0 ? unlocked : data.achievements || []);
                } else {
                    setAchievements(data?.achievements || []);
                }
            }
        } catch (err) {
            console.error('Error al cargar galería:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [refreshSignal]);

    if (loading) return (
        <div className="space-y-6">
            <div className="w-40 h-6 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-44 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-textPrimary dark:text-white flex items-center gap-2">
                        <FiStar className="text-accent" /> Galería de Méritos
                        {USE_MOCK && (
                            <span className="text-[9px] font-bold bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-widest ml-1">
                                Debug
                            </span>
                        )}
                    </h3>
                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">
                        Hitos Desbloqueados en Quantify
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {achievements.length > 0 && (
                        <span className="bg-accent/20 text-accent text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            {achievements.length} {achievements.length === 1 ? 'Logro' : 'Logros'}
                        </span>
                    )}
                    <button onClick={fetchAchievements} title="Actualizar galería"
                        className="p-2 rounded-xl text-textMuted hover:text-primary hover:bg-primary/10 transition-all">
                        <FiRefreshCw size={14} />
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {achievements.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-10 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] text-center space-y-4">
                        <div className="inline-flex p-4 bg-gray-50 dark:bg-white/5 rounded-full text-gray-400">
                            <FiLock size={32} />
                        </div>
                        <div>
                            <p className="font-bold text-textPrimary dark:text-gray-300">Aún no has desbloqueado méritos</p>
                            <p className="text-xs text-textMuted max-w-[240px] mx-auto mt-1">
                                Mantén tu racha y cumple tus objetivos para ver tu vitrina llena.
                            </p>
                        </div>
                        {error && <button onClick={fetchAchievements} className="text-xs text-primary underline">Reintentar</button>}
                    </motion.div>
                ) : (
                    <motion.div key="grid" variants={container} initial="hidden" animate="show"
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {achievements.map((achievement) => {
                            const rarity = getRarityStyle(achievement);
                            const { Icon, color } = getIcon(achievement);
                            const req = getRequirement(achievement);
                            return (
                                <motion.div
                                    key={achievement.id || achievement.titulo}
                                    variants={cardVariant}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    className={`group relative bg-zinc-900 dark:bg-white/5 border ${rarity.border} p-6 rounded-[2rem] flex flex-col items-center text-center cursor-default transition-all duration-300 hover:shadow-2xl ${rarity.shadow}`}
                                >
                                    {/* Rarity badge */}
                                    <span className={`absolute top-3 right-3 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${rarity.badgeColor}`}>
                                        {rarity.badge}
                                    </span>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 bg-gradient-to-br ${rarity.gradient} rounded-2xl flex items-center justify-center shadow-lg mb-4 transform group-hover:rotate-12 transition-transform duration-300`}>
                                        <Icon size={32} color="white" />
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight leading-tight mb-2">
                                        {achievement.titulo}
                                    </h4>

                                    {/* Requirement pill */}
                                    {req && (
                                        <span className="flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 uppercase tracking-widest mb-2">
                                            <FiTarget size={7} /> {req}
                                        </span>
                                    )}

                                    {/* Month */}
                                    {achievement.mes_logro && (
                                        <p className="text-[9px] font-bold uppercase tracking-tighter text-accent">
                                            {achievement.mes_logro}
                                        </p>
                                    )}

                                    {/* Hover tooltip */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center bg-black/95 rounded-[2rem] p-5 z-10 pointer-events-none gap-3">
                                        <Icon size={30} color={color} />
                                        <p className="text-[10px] font-bold text-white text-center leading-relaxed">
                                            {achievement.descripcion}
                                        </p>
                                        {req && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold px-3 py-1 rounded-full border border-accent/30 text-accent bg-accent/10 uppercase tracking-wider">
                                                <FiTarget size={8} /> Meta: {req}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
