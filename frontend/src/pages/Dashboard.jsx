import { useState, useEffect } from 'react';
import { getHabits, createHabit, createLog, getAdherence, deleteHabit, getGlobalStats } from '../services/habitService';
import { FiPlus, FiCheckCircle, FiTrash2, FiChevronRight, FiHome, FiActivity, FiZap, FiLock } from 'react-icons/fi';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AdherenceChart from '../components/AdherenceChart';
import HabitInsights from '../components/HabitInsights';
import AddHabitModal from '../components/AddHabitModal';
import AchievementToast from '../components/AchievementToast';
import TrophyGallery from '../components/TrophyGallery';
import PremiumOnboardingModal from '../components/PremiumOnboardingModal';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

const Dashboard = () => {
    const { user, updateLocalUser } = useAuth();
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
    const [habitToDelete, setHabitToDelete] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmartMode, setIsSmartMode] = useState(true);
    const [unlockedAchievement, setUnlockedAchievement] = useState(null);
    const [achievementRefreshKey, setAchievementRefreshKey] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [userLevelData, setUserLevelData] = useState({ currentLevel: 1, progressXP: 0, totalXP: 0, xpNextLevel: 100 });
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingInitialStep, setOnboardingInitialStep] = useState(0);
    
    // Admin users AND explicitly premium users have AI access.
    const isPremium = user?.rol === 0 || user?.is_premium;
    const isAILocked = !isPremium;

    useEffect(() => {
        // Enforce tutorial only for non-admin accounts who haven't seen it
        const hasSeenTutorialKey = `saw_tutorial_${user?.id}`;
        const hasSeenTutorial = localStorage.getItem(hasSeenTutorialKey) === 'true';
        
        if (!hasSeenTutorial && user?.rol !== 0) {
            setOnboardingInitialStep(0);
            setShowOnboarding(true);
        }

        loadHabits();

        // Polling fallback to guarantee instant updates in serverless environments
        const interval = setInterval(() => {
            loadHabits();
        }, 4000);

        // Real-time synchronization via Socket.io
        let socketInstance;
        api.get('/auth/profile').then(res => {
            const uid = res.data?.data?.user?.id;
            import('../services/socket').then(({ initSocket }) => {
                socketInstance = initSocket(uid);
                socketInstance?.on('habit_updated', () => loadHabits());
                socketInstance?.on('dashboard_updated', () => loadHabits());
            });
        }).catch(() => { });

        return () => {
            clearInterval(interval);
            socketInstance?.off('habit_updated');
            socketInstance?.off('dashboard_updated');
        };
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

    const triggerDeleteHabit = (e, habit) => {
        e.stopPropagation();
        setHabitToDelete(habit);
    };

    const confirmDeleteHabit = async () => {
        if (!habitToDelete) return;
        const habitId = habitToDelete.id;

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
        } finally {
            setHabitToDelete(null);
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
            if (globalRes.data.xpData) setUserLevelData(globalRes.data.xpData);

            if (selectedHabitId === habitId) {
                loadStatsFor(habitId);
            } else if (isGlobalView) {
                switchToGlobalView(globalRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpgradePremium = async () => {
        try {
            await api.patch('/profile/premium-activate');
            updateLocalUser({ is_premium: true });
        } catch(e) {
            console.error('Failed to activate premium mockup', e);
        }
    };

    return (
        <div className="w-full space-y-8 fade-in">
            <header className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                <div className="flex-1 flex flex-col justify-end">
                    <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-4 brightness-110 tracking-tight">
                        Tus Hábitos
                    </h1>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                        <div
                            onClick={() => switchToGlobalView()}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${isGlobalView
                                ? 'bg-primary/20 border-primary/40 ring-1 ring-primary/30'
                                : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                                }`}
                        >
                            <FiActivity className="text-primary text-xl shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1 truncate">Bienestar</p>
                                <span className="text-lg font-black text-primary leading-none">{globalStats.globalScore}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 rounded-xl border border-success/20">
                            <FiCheckCircle className="text-success text-xl shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-success uppercase tracking-widest leading-none mb-1 truncate">Completado</p>
                                <span className="text-lg font-black text-success leading-none">{globalStats.dailyCompletion || 0}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <FiZap className="text-orange-400 text-xl shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none mb-1 truncate">Racha Actual</p>
                                <span className="text-lg font-black text-orange-400 leading-none">{currentStreak} Días</span>
                            </div>
                        </div>
                        
                        {/* Radial Focus Progress Widget (Nivel) */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                {/* SVG Rings */}
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-blue-500/20" />
                                    <circle 
                                        cx="16" cy="16" r="14" 
                                        stroke="url(#focusGradient)" 
                                        strokeWidth="3" 
                                        fill="transparent" 
                                        strokeDasharray={2 * Math.PI * 14} 
                                        strokeDashoffset={(2 * Math.PI * 14) - (userLevelData.progressXP / 100) * (2 * Math.PI * 14)} 
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#34A853" />
                                            <stop offset="100%" stopColor="#4285F4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                {/* Center Number */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-blue-400">{userLevelData.currentLevel}</span>
                                </div>
                            </div>
                            <div className="min-w-0" title={`${userLevelData.totalXP} XP Histórico`}>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1 truncate">Nivel Global</p>
                                <div className="text-lg font-black text-blue-400 leading-none">{userLevelData.progressXP} / 100 XP</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10 opacity-70 grayscale cursor-not-allowed select-none transition-all hover:opacity-100">
                            <FiLock size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">Coming Soon</p>
                                <span className="text-sm font-black text-gray-500 dark:text-gray-400 leading-none">Desafíos</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10 opacity-70 grayscale cursor-not-allowed select-none transition-all hover:opacity-100">
                            <FiLock size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">Coming Soon</p>
                                <span className="text-sm font-black text-gray-500 dark:text-gray-400 leading-none">Analítica IA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Actions Container */}
                <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">

                    {/* Manual Button */}
                    <button
                        onClick={() => { setIsSmartMode(false); setIsModalOpen(true); }}
                        className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl px-6 py-5 flex flex-col justify-center items-center gap-3 hover:border-textPrimary dark:hover:border-white/30 hover:shadow-lg transition-all"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <FiPlus size={24} className="text-textPrimary dark:text-white" />
                        </div>
                        <span className="font-bold text-sm text-textPrimary dark:text-white whitespace-nowrap">Hábito Manual</span>
                    </button>

                    {/* AI Assistant Command Center */}
                    <div className="w-full sm:w-[320px] lg:w-[350px] bg-gradient-to-br from-[#4285F4]/10 via-[#EA4335]/5 to-[#34A853]/10 border border-[#4285F4]/20 rounded-3xl p-5 shadow-[0_0_20px_rgba(66,133,244,0.1)] flex flex-col justify-between items-start gap-4 transition-all hover:shadow-[0_0_30px_rgba(66,133,244,0.15)] relative overflow-hidden group">
                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4285F4]/20 blur-[50px] rounded-full group-hover:bg-[#4285F4]/30 transition-all duration-700"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#34A853]/20 blur-[40px] rounded-full"></div>

                        <div className="relative z-10 w-full mb-2">
                            <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#34A853] flex items-center gap-1.5 text-lg mb-2">
                                Asistente Quantify {isPremium && <span className="text-[9px] uppercase tracking-wider text-white bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-0.5 rounded-full ring-1 ring-yellow-400/50">PRO</span>}
                            </h3>
                            <p className="text-[13px] text-textPrimary dark:text-gray-300 font-medium leading-snug">
                                {isAILocked 
                                    ? `Generador de objetivos exclusivo para cuentas Premium. Adquiere Quantify Pro para calibrar la IA a que diseñe tu rutina.`
                                    : currentStreak > 3
                                        ? `¡Excelente racha! Consistencia sólida. ¿Integramos un nuevo reto a tu rutina?`
                                        : currentStreak > 0
                                            ? `Llevas ${currentStreak} días. Sigue agregando hábitos inteligentes a tu vida.`
                                            : "Momento perfecto para comprometerte con un objetivo trazado por IA."
                                }
                            </p>
                        </div>

                        <button
                            onClick={() => { 
                                if (!isAILocked) { 
                                    setIsSmartMode(true); setIsModalOpen(true); 
                                } else {
                                    setOnboardingInitialStep(3); // Jump straight to paywall
                                    setShowOnboarding(true);
                                }
                            }}
                            className={`relative z-10 w-full bg-white dark:bg-[#0a0a0a] overflow-hidden group/btn border rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${isAILocked ? 'border-gray-200 dark:border-white/5 opacity-80 hover:opacity-100 grayscale hover:grayscale-0' : 'border-gray-200 dark:border-white/10 hover:border-[#4285F4]/50 hover:shadow-[0_0_15px_rgba(66,133,244,0.2)]'}`}
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            {isAILocked ? <FiLock size={20} className="text-gray-400 dark:text-gray-600 relative z-10 shrink-0" /> : <FiPlus size={20} className="text-[#4285F4] relative z-10 shrink-0" />}
                            <span className="font-bold border-b-2 border-transparent text-sm text-textPrimary dark:text-white relative z-10 group-hover/btn:border-[#4285F4]/50 transition-all truncate">
                                {isAILocked ? 'Desbloquear PREMIUM' : 'Hábito Inteligente'}
                            </span>
                        </button>
                    </div>
                </div>
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
                        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {habits.map((habit, idx) => {
                                const isCompleted = habit.completado_hoy;
                                return (
                                    <motion.div
                                        key={habit.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                                        whileTap={!isCompleted ? { scale: 0.95 } : {}}
                                        className={`glass-card cursor-pointer flex flex-col justify-between items-start group transition-all duration-500 ${isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-500/50 opacity-75' : selectedHabitId === habit.id ? 'border-primary dark:border-white ring-1 ring-primary/30 dark:ring-white/30 shadow-md bg-blue-50/30 dark:bg-white/10' : 'hover:border-blue-200 dark:hover:border-white/20 dark:border-white/5 hover:shadow-md dark:bg-surface'}`}
                                        onClick={() => loadStatsFor(habit.id)}
                                    >
                                        <div className="flex w-full justify-between items-center mb-1 gap-2">
                                            <h3 className={`font-bold text-lg capitalize transition-colors truncate max-w-[70%] ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : selectedHabitId === habit.id ? 'text-primary dark:text-white' : 'text-textPrimary group-hover:text-primary dark:group-hover:text-white'}`} title={habit.nombre}>
                                                {habit.nombre}
                                            </h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    className="text-gray-300 dark:text-gray-600 hover:text-danger transition-colors p-1"
                                                    onClick={(e) => triggerDeleteHabit(e, habit)}
                                                    title="Eliminar permanentemente"
                                                >
                                                    <FiTrash2 size={22} />
                                                </button>
                                                <motion.button
                                                    whileTap={!isCompleted ? { scale: 0.8 } : {}}
                                                    className={`transition-all duration-500 p-1 ${isCompleted ? 'text-green-500 scale-125 pointer-events-none cursor-default' : 'text-gray-300 dark:text-gray-600 hover:text-success dark:hover:text-success'}`}
                                                    onClick={(e) => { e.stopPropagation(); if (!isCompleted) handleLogDone(habit.id); }}
                                                    title={isCompleted ? "Completado hoy" : "Marcar completado hoy"}
                                                    disabled={isCompleted}
                                                >
                                                    <FiCheckCircle size={26} />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedHabitId === habit.id ? 'bg-primary/10 dark:bg-white/20 text-primary dark:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                                            {habit.frecuencia}
                                        </span>
                                    </motion.div>
                                );
                            })}
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
                isSmartMode={isSmartMode}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHabit}
            />

            <PremiumOnboardingModal 
                isOpen={showOnboarding}
                initialStep={onboardingInitialStep}
                onClose={() => { 
                    setShowOnboarding(false);
                    localStorage.setItem(`saw_tutorial_${user?.id}`, 'true');
                }}
                onUpgrade={() => {
                    handleUpgradePremium();
                    localStorage.setItem(`saw_tutorial_${user?.id}`, 'true');
                }}
            />
            <AchievementToast
                achievement={unlockedAchievement}
                onClose={() => setUnlockedAchievement(null)}
            />

            {/* Custom Delete Confirmation Modal (Rendered outside DOM hierarchy via Portal to avoid CSS transform relative traps) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {habitToDelete && (
                        <motion.div
                            key="delete-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setHabitToDelete(null)}
                        >
                            <motion.div
                                key="delete-modal"
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-[10000] overflow-hidden"
                            >
                                {/* Decorative top red glow */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>

                                <h3 className="text-xl md:text-2xl font-black text-textPrimary dark:text-white mb-2 flex items-center gap-2">
                                    <FiTrash2 className="text-danger" />
                                    Eliminar Hábito
                                </h3>
                                <p className="text-textMuted dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                    ¿Estás seguro de eliminar el hábito <span className="text-primary dark:text-white font-bold">"{habitToDelete.nombre}"</span> y todo su historial de forma permanente? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex justify-end gap-3 w-full">
                                    <button
                                        className="flex-1 md:flex-none px-5 py-2.5 font-bold text-gray-500 hover:text-textPrimary dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl"
                                        onClick={() => setHabitToDelete(null)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="flex-1 md:flex-none px-5 py-2.5 bg-danger hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-danger/20 transition-all flex justify-center items-center gap-2"
                                        onClick={confirmDeleteHabit}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Dashboard;
