import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiAward, FiStar, FiTrendingUp, FiLock, FiUnlock, 
    FiCheckCircle, FiTarget, FiSearch, FiFilter, FiRefreshCw,
    FiShield, FiZap, FiActivity, FiWatch, FiGrid, FiCheck
} from 'react-icons/fi';
import { 
    GiRocket, GiMedal, GiBrain, GiMoon, GiWaterDrop, 
    GiDutchBike, GiRun, GiWeightLiftingUp, GiCrown, GiSparkles 
} from 'react-icons/gi';
import api from '../services/api';

// Map of icons by key
const ICON_MAP = {
    'pionero':       { Icon: GiSparkles,         color: 'from-amber-400 to-yellow-500',   text: 'text-amber-400' },
    'chispa':        { Icon: FiZap,              color: 'from-orange-500 to-amber-500',  text: 'text-orange-400' },
    'estelar':       { Icon: FiStar,             color: 'from-yellow-400 to-amber-600', text: 'text-yellow-400' },
    'forjado':       { Icon: GiWeightLiftingUp,  color: 'from-amber-500 to-orange-600',  text: 'text-amber-400' },
    'imparable':     { Icon: GiRocket,           color: 'from-purple-500 to-pink-500',   text: 'text-purple-400' },
    'leyenda':       { Icon: GiCrown,            color: 'from-amber-300 via-yellow-500 to-amber-600', text: 'text-amber-300' },
    'caminante':     { Icon: GiRun,              color: 'from-emerald-400 to-teal-600',  text: 'text-emerald-400' },
    'cadencia':      { Icon: GiDutchBike,        color: 'from-sky-400 to-blue-600',     text: 'text-sky-400' },
    'sobrecarga':    { Icon: GiWeightLiftingUp,  color: 'from-rose-500 to-red-700',     text: 'text-rose-400' },
    'biologico':     { Icon: GiMoon,             color: 'from-indigo-400 to-purple-600',text: 'text-indigo-400' },
    'oasis':         { Icon: GiWaterDrop,        color: 'from-cyan-400 to-blue-600',    text: 'text-cyan-400' },
    'flujo':         { Icon: GiBrain,            color: 'from-violet-500 to-purple-700',text: 'text-violet-400' },
    'alquimista':    { Icon: FiActivity,         color: 'from-teal-400 to-emerald-600', text: 'text-teal-400' },
    'arquitecto':    { Icon: FiGrid,             color: 'from-blue-400 to-indigo-600',  text: 'text-blue-400' },
    'sincronizacion':{ Icon: FiWatch,            color: 'from-fuchsia-500 to-purple-600',text: 'text-fuchsia-400' },
    'default':       { Icon: GiMedal,            color: 'from-blue-500 to-indigo-600',  text: 'text-blue-400' }
};

const getIconData = (key = '', title = '') => {
    if (key && ICON_MAP[key]) return ICON_MAP[key];
    const t = title.toLowerCase();
    const foundKey = Object.keys(ICON_MAP).find(k => t.includes(k));
    return foundKey ? ICON_MAP[foundKey] : ICON_MAP['default'];
};

const getRarityBadge = (rareza = 'Común') => {
    switch (rareza) {
        case 'Legendario':
            return {
                bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                border: 'border-purple-500/30',
                glow: 'shadow-purple-500/20 hover:border-purple-400',
                label: 'LEGENDARIO'
            };
        case 'Épico':
            return {
                bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                border: 'border-amber-500/30',
                glow: 'shadow-amber-500/20 hover:border-amber-400',
                label: 'ÉPICO'
            };
        case 'Raro':
            return {
                bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
                border: 'border-sky-500/30',
                glow: 'shadow-sky-500/20 hover:border-sky-400',
                label: 'RARO'
            };
        default:
            return {
                bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                border: 'border-emerald-500/30',
                glow: 'shadow-emerald-500/20 hover:border-emerald-400',
                label: 'COMÚN'
            };
    }
};

const CATEGORIES = ['Todas', 'Constancia', 'Salud', 'Bienestar', 'Productividad', 'Smartwatch', 'Plataforma'];

const AchievementsPage = () => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'UNLOCKED', 'LOCKED'
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const fetchAchievements = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/achievements');
            const data = res.data.data;
            if (data?.catalog) {
                setCatalog(data.catalog);
            } else if (data?.achievements) {
                // Fallback direct list
                setCatalog(data.achievements.map(a => ({ ...a, unlocked: true })));
            }
        } catch (err) {
            console.error('Error al cargar logros:', err);
            setError('No se pudieron cargar los logros del servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    // Filter calculations
    const unlockedCount = catalog.filter(a => a.unlocked).length;
    const totalCount = catalog.length;
    const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    const filteredCatalog = catalog.filter(item => {
        // Status filter
        if (statusFilter === 'UNLOCKED' && !item.unlocked) return false;
        if (statusFilter === 'LOCKED' && item.unlocked) return false;

        // Category filter
        if (categoryFilter !== 'Todas' && item.categoria !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = item.titulo.toLowerCase().includes(q);
            const matchDesc = item.descripcion?.toLowerCase().includes(q);
            const matchReq = item.requisito?.toLowerCase().includes(q);
            if (!matchTitle && !matchDesc && !matchReq) return false;
        }

        return true;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
    };

    return (
        <div className="w-full space-y-8 fade-in pb-12">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
                            <GiCrown size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-primary dark:text-white tracking-tight">
                                Logros y Méritos
                            </h1>
                            <p className="text-textMuted text-sm font-medium mt-0.5">
                                Colecciona insignias exclusivas por demostrar consistencia e ingeniería en tu vida.
                            </p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={fetchAchievements} 
                    disabled={loading}
                    className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-textPrimary dark:text-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
                >
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Actualizar Vitrina</span>
                </button>
            </header>

            {/* Collection overview banner */}
            <div className="glass-card relative overflow-hidden p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                            Progreso de Colección
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {unlockedCount} de {totalCount} Logros Conquistados
                        </h2>
                        <p className="text-xs text-gray-400 max-w-md">
                            Completa tus hábitos diarios, mantén tu racha de login y sincroniza tu biometría para desbloquear la colección completa.
                        </p>
                    </div>

                    {/* Circular or Bar Progress */}
                    <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-400">Completado</span>
                            <span className="text-amber-400 font-mono text-sm">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Decorative background glow */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Filters and Search toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                {/* Status Toggle Pills */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-x-auto">
                    <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            statusFilter === 'ALL'
                                ? 'bg-accent text-white shadow-md shadow-accent/20'
                                : 'text-textMuted hover:text-textPrimary dark:hover:text-white'
                        }`}
                    >
                        Todos ({totalCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('UNLOCKED')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            statusFilter === 'UNLOCKED'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'text-textMuted hover:text-emerald-400'
                        }`}
                    >
                        <FiCheckCircle size={13} /> Desbloqueados ({unlockedCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('LOCKED')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            statusFilter === 'LOCKED'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                                : 'text-textMuted hover:text-amber-400'
                        }`}
                    >
                        <FiLock size={13} /> Bloqueados ({totalCount - unlockedCount})
                    </button>
                </div>

                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar logro por nombre o requisito..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-xs font-medium text-textPrimary dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-all"
                    />
                </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1 mr-1">
                    <FiFilter size={12} /> Categoría:
                </span>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                            categoryFilter === cat
                                ? 'bg-primary dark:bg-white text-white dark:text-black font-bold shadow'
                                : 'bg-gray-100 dark:bg-white/5 text-textMuted hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main achievements grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-56 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-12 text-center border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 space-y-3">
                    <p className="text-sm font-bold text-red-400">{error}</p>
                    <button onClick={fetchAchievements} className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl">
                        Reintentar
                    </button>
                </div>
            ) : filteredCatalog.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl space-y-3">
                    <FiLock size={36} className="mx-auto text-gray-400" />
                    <p className="text-base font-bold text-textPrimary dark:text-gray-300">
                        No se encontraron logros con los filtros seleccionados
                    </p>
                    <button 
                        onClick={() => { setStatusFilter('ALL'); setCategoryFilter('Todas'); setSearchQuery(''); }}
                        className="text-xs text-accent font-bold hover:underline"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                    {filteredCatalog.map(item => {
                        const { Icon, color, text } = getIconData(item.icono_key, item.titulo);
                        const rarity = getRarityBadge(item.rareza);
                        const isUnlocked = item.unlocked;

                        return (
                            <motion.div
                                key={item.id}
                                variants={cardVariants}
                                whileHover={{ y: -6, scale: 1.02 }}
                                onClick={() => setSelectedAchievement(item)}
                                className={`relative group p-6 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                                    isUnlocked
                                        ? `bg-zinc-900 dark:bg-white/5 border ${rarity.border} shadow-lg ${rarity.glow}`
                                        : 'bg-gray-100/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/5 opacity-75 hover:opacity-100'
                                }`}
                            >
                                {/* Top status & badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                                        isUnlocked ? rarity.bg : 'bg-gray-200 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-400'
                                    }`}>
                                        {rarity.label}
                                    </span>

                                    {isUnlocked ? (
                                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                            <FiCheck size={12} /> Desbloqueado
                                        </span>
                                    ) : (
                                        <div className="p-1.5 bg-gray-200 dark:bg-white/10 text-gray-400 rounded-full">
                                            <FiLock size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Icon container */}
                                <div className="flex flex-col items-center text-center space-y-3 my-2">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                                        isUnlocked
                                            ? `bg-gradient-to-br ${color} text-white`
                                            : 'bg-gray-300 dark:bg-white/10 text-gray-400 dark:text-gray-500 grayscale'
                                    }`}>
                                        <Icon size={32} />
                                    </div>

                                    <div>
                                        <h3 className={`font-black text-base leading-snug ${
                                            isUnlocked ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {item.titulo}
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted mt-0.5 inline-block">
                                            {item.categoria}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom info & Requirement */}
                                <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5 space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed text-center">
                                        {item.descripcion}
                                    </p>

                                    {item.requisito && (
                                        <div className={`flex items-center justify-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-xl text-center ${
                                            isUnlocked
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                        }`}>
                                            <FiTarget size={11} className="shrink-0" />
                                            <span className="truncate">{item.requisito}</span>
                                        </div>
                                    )}

                                    {isUnlocked && item.mes_logro && (
                                        <p className="text-[9px] font-bold text-accent text-center uppercase tracking-wider">
                                            Obtenido en: {item.mes_logro}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Achievement Detail Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl relative space-y-6"
                        >
                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm font-bold bg-white/5 p-2 rounded-full"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                {(() => {
                                    const { Icon, color } = getIconData(selectedAchievement.icono_key, selectedAchievement.titulo);
                                    const rarity = getRarityBadge(selectedAchievement.rareza);
                                    return (
                                        <>
                                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl ${
                                                selectedAchievement.unlocked
                                                    ? `bg-gradient-to-br ${color} text-white`
                                                    : 'bg-white/10 text-gray-400'
                                            }`}>
                                                <Icon size={40} />
                                            </div>

                                            <div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border tracking-widest ${rarity.bg}`}>
                                                    {rarity.label} • {selectedAchievement.categoria}
                                                </span>
                                                <h3 className="text-2xl font-black mt-2">
                                                    {selectedAchievement.titulo}
                                                </h3>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</h4>
                                    <p className="text-sm font-medium mt-1 leading-relaxed">
                                        {selectedAchievement.descripcion}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                        <FiTarget size={14} /> Cómo Desbloquear
                                    </h4>
                                    <p className="text-xs font-semibold text-gray-300 mt-1">
                                        {selectedAchievement.requisito}
                                    </p>
                                </div>

                                {selectedAchievement.unlocked ? (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                        <FiCheckCircle size={16} />
                                        <span>¡Logro desbloqueado y registrado en tu perfil!</span>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-xs font-bold">
                                        <FiLock size={16} />
                                        <span>Logro aún bloqueado. ¡Sigue progresando para obtenerlo!</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="w-full py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-wider"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AchievementsPage;
