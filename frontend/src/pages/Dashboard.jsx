import { useState, useEffect } from 'react';
import { getHabits, createHabit, createLog, getAdherence, deleteHabit, getGlobalStats } from '../services/habitService';
import { FiPlus, FiCheckCircle, FiTrash2, FiChevronRight, FiHome, FiActivity, FiZap } from 'react-icons/fi';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AdherenceChart from '../components/AdherenceChart';
import HabitInsights from '../components/HabitInsights';
import AddHabitModal from '../components/AddHabitModal';
import AchievementToast from '../components/AchievementToast';
import TrophyGallery from '../components/TrophyGallery';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [habits, setHabits] = useState([]);
    const [globalStats, setGlobalStats] = useState({ globalScore: 0, dailyCompletion: 0, totalHabits: 0, dailyPerformance: [] });
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [lastSelectedHabitId, setLastSelectedHabitId] = useState(null);
    const [isGlobalView, setIsGlobalView] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [adherenceScore, setAdherenceScore] = useState(0);
    const [tendenciaSemanal, setTendenciaSemanal] = useState(0);
    const [isNewHabit, setIsNewHabit] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [unlockedAchievement, setUnlockedAchievement] = useState(null);
    const [achievementRefreshKey, setAchievementRefreshKey] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            const [habitsRes, globalRes] = await Promise.all([
                getHabits(),
                getGlobalStats()
            ]);

            setHabits(habitsRes.data);
            setGlobalStats(globalRes.data);

            // Use actual user streak from database
            setCurrentStreak(user?.current_streak || 0);

            // By default, show global view on first load
            if (isGlobalView) {
                setChartData(globalRes.data.dailyPerformance || []);
                setAdherenceScore(globalRes.data.globalScore || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const loadStatsFor = async (id) => {
        setIsGlobalView(false);
        setLastSelectedHabitId(id); // Track last visited habit
        setSelectedHabitId(id);
        try {
            const res = await getAdherence(id);
            setChartData(res.data.chartData || []);
            setAdherenceScore(res.data.adherenceScore || 0);
            setTendenciaSemanal(res.data.tendenciaSemanal || 0);
            setIsNewHabit(res.data.isNewHabit || false);
        } catch (error) {
            console.error(error);
            setChartData([]);
            setAdherenceScore(0);
            setTendenciaSemanal(0);
            setIsNewHabit(false);
        }
    };

    const switchToGlobalView = (stats) => {
        const data = stats || globalStats;
        setIsGlobalView(true);
        setSelectedHabitId(null);
        setChartData(data.dailyPerformance || []);
        setAdherenceScore(data.globalScore || 0);
        setTendenciaSemanal(0);
        setIsNewHabit(false);
    };

    const handleSaveHabit = async (habitData) => {
        try {
            const res = await createHabit(habitData);
            setIsModalOpen(false);
            // Reset dailyCompletion immediately so it doesn't show stale 100%
            // while the new API call calculates the real value (new habit = not completed yet)
            setGlobalStats(prev => ({ ...prev, dailyCompletion: 0 }));
            await loadHabits();
            // After creating a new habit, show its detail view
            loadStatsFor(res.data.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteHabit = async (e, habitId) => {
        e.stopPropagation();
        const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este hábito y todos sus historiales de forma permanente?');
        if (!confirmed) return;

        try {
            await deleteHabit(habitId);
            const remainingHabits = habits.filter(h => h.id !== habitId);
            setHabits(remainingHabits);

            if (selectedHabitId === habitId) {
                switchToGlobalView();
            } else {
                // Refresh global stats after deletion
                const globalRes = await getGlobalStats();
                setGlobalStats(globalRes.data);
                if (isGlobalView) switchToGlobalView(globalRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogDone = async (habitId) => {
        try {
            const logData = {
                habito_id: habitId,
                fecha_registro: new Date().toISOString().split('T')[0],
                completado: true,
                valor_registrado: 1
            };
            const res = await createLog(logData);

            if (res.data.unlockedAchievement) {
                setUnlockedAchievement(res.data.unlockedAchievement);
                setAchievementRefreshKey(k => k + 1); // Trigger TrophyGallery re-fetch
            }

            // Refresh habits list (streaks, etc)
            const habitsRes = await getHabits();
            setHabits(habitsRes.data);

            // Refresh global data
            const globalRes = await getGlobalStats();
            setGlobalStats(globalRes.data);

            if (selectedHabitId === habitId) {
                loadStatsFor(habitId);
            } else if (isGlobalView) {
                switchToGlobalView(globalRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full space-y-8 fade-in">
            <header className="flex flex-col lg:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 brightness-110 tracking-tight">
                        Tus Hábitos
                    </h1>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div
                            onClick={() => switchToGlobalView()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${isGlobalView
                                ? 'bg-primary/20 border-primary/40 ring-1 ring-primary/30'
                                : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                                }`}
                        >
                            <FiActivity className="text-primary text-xl" />
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none">Bienestar Global</p>
                                <span className="text-xl font-black text-primary">{globalStats.globalScore}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20">
                            <FiCheckCircle className="text-success text-xl" />
                            <div>
                                <p className="text-xs font-bold text-success uppercase tracking-widest leading-none">Completado Hoy</p>
                                <span className="text-xl font-black text-success">{globalStats.dailyCompletion || 0}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <FiZap className="text-orange-400 text-xl" />
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest leading-none">Racha Actual</p>
                                <span className="text-xl font-black text-orange-400">{currentStreak} Días</span>
                            </div>
                        </div>
                        <p className="text-textMuted text-lg font-medium hidden md:block border-l border-gray-200 dark:border-white/10 pl-4">
                            Tus rachas determinan tus resultados.
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-accent px-8 py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 transition-all">
                    <FiPlus size={22} className="stroke-[3]" /> <span className="font-bold">Añadir Hábito</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Lateral: Lista de Hábitos */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
                            <span className="w-2 h-6 rounded bg-primary dark:bg-white"></span>
                            Catálogo
                        </h2>
                        {!isGlobalView && (
                            <button
                                onClick={() => switchToGlobalView()}
                                className="text-xs font-bold text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
                            >

                            </button>
                        )}
                    </div>

                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="glass-card flex flex-col justify-between items-start h-[100px] animate-pulse cursor-wait">
                                <div className="w-full flex justify-between items-center mb-2">
                                    <div className="w-1/2 h-5 bg-gray-200 dark:bg-white/10 rounded-md"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10"></div>
                                </div>
                                <div className="w-1/4 h-4 bg-gray-200 dark:bg-white/10 rounded-md mt-auto"></div>
                            </div>
                        ))
                    ) : habits.length === 0 ? (
                        <div className="text-textMuted text-base font-medium p-8 glass-card text-center bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                            No tienes hábitos. ¡Crea uno arriba!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {habits.map((habit, idx) => (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    className={`glass-card cursor-pointer flex flex-col justify-between items-start group transition-all duration-300 ${selectedHabitId === habit.id ? 'border-primary dark:border-white ring-1 ring-primary/30 dark:ring-white/30 shadow-md bg-blue-50/30 dark:bg-white/10' : 'hover:border-blue-200 dark:hover:border-white/20 dark:border-white/5 hover:shadow-md dark:bg-surface'}`}
                                    onClick={() => loadStatsFor(habit.id)}
                                >
                                    <div className="flex w-full justify-between items-center mb-1 gap-2">
                                        <h3 className={`font-bold text-lg capitalize transition-colors truncate max-w-[70%] ${selectedHabitId === habit.id ? 'text-primary dark:text-white' : 'text-textPrimary group-hover:text-primary dark:group-hover:text-white'}`} title={habit.nombre}>
                                            {habit.nombre}
                                        </h3>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                className="text-gray-300 dark:text-gray-600 hover:text-danger transition-colors p-1"
                                                onClick={(e) => handleDeleteHabit(e, habit.id)}
                                                title="Eliminar permanentemente"
                                            >
                                                <FiTrash2 size={22} />
                                            </button>
                                            <button
                                                className="text-gray-300 dark:text-gray-600 hover:text-success dark:hover:text-success transition-colors p-1"
                                                onClick={(e) => { e.stopPropagation(); handleLogDone(habit.id); }}
                                                title="Marcar completado hoy"
                                            >
                                                <FiCheckCircle size={26} />
                                            </button>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedHabitId === habit.id ? 'bg-primary/10 dark:bg-white/20 text-primary dark:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                                        {habit.frecuencia}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main: Gráficas de Adherencia */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="glass-card w-full h-[500px] animate-pulse bg-gray-100/50 dark:bg-white/5 flex items-center justify-center">
                            <p className="text-gray-400 dark:text-gray-600 font-bold tracking-widest text-sm uppercase">Cargando Insights...</p>
                        </div>
                    ) : (
                        <div className="glass-card dark:border-white/5 dark:bg-surface">
                            {/* Tab Toggle */}
                            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
                                <button
                                    onClick={() => switchToGlobalView()}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isGlobalView
                                        ? 'bg-white dark:bg-surface shadow-md text-primary dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                                        }`}
                                >
                                    <FiActivity size={14} /> Performance Global
                                </button>
                                <button
                                    onClick={() => {
                                        const targetId = lastSelectedHabitId || (habits.length > 0 ? habits[0].id : null);
                                        if (targetId) loadStatsFor(targetId);
                                    }}
                                    disabled={habits.length === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${!isGlobalView
                                        ? 'bg-white dark:bg-surface shadow-md text-primary dark:text-white'
                                        : habits.length === 0
                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                                        }`}
                                >
                                    <FiChevronRight size={14} /> Adherencia del Hábito
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-100 dark:border-white/10 pb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-primary dark:text-white mb-1">
                                        {isGlobalView ? 'Performance Global' : 'Métricas de Adherencia'}
                                    </h2>
                                    <p className="text-textMuted font-medium">
                                        {isGlobalView ? 'Frecuencia agregada de todos tus hábitos' : 'Progreso de los últimos 30 días'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-4xl font-black transition-colors ${isNewHabit && !isGlobalView ? 'text-blue-500' : 'text-success'}`}>
                                        {adherenceScore}%
                                    </span>
                                    <p className="text-sm font-bold text-textMuted uppercase tracking-wider">
                                        {isGlobalView ? 'Adherencia Total' : isNewHabit ? 'Calibrando Fase' : 'Tasa de Adherencia'}
                                    </p>
                                </div>
                            </div>
                            <AdherenceChart data={chartData} isGlobal={isGlobalView} />
                            {!isGlobalView && <HabitInsights adherenceScore={adherenceScore} tendenciaSemanal={tendenciaSemanal} />}
                            {isGlobalView && (
                                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <h4 className="text-primary font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                                        <FiActivity /> Análisis de Carga
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Estás visualizando el flujo de trabajo de todo tu catálogo. Esta métrica representa la consistencia operativa combinada.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                <TrophyGallery refreshSignal={achievementRefreshKey} />
            </div>

            <AddHabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHabit}
            />
            <AchievementToast
                achievement={unlockedAchievement}
                onClose={() => setUnlockedAchievement(null)}
            />
        </div>
    );
};

export default Dashboard;
