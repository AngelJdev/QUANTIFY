import { useState, useEffect } from 'react';
import { getHabits, createHabit, createLog, getAdherence, deleteHabit } from '../services/habitService';
import { FiPlus, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import AdherenceChart from '../components/AdherenceChart';
import AddHabitModal from '../components/AddHabitModal';

const Dashboard = () => {
    const [habits, setHabits] = useState([]);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [adherenceScore, setAdherenceScore] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            const res = await getHabits();
            setHabits(res.data);
            if (res.data.length > 0 && !selectedHabitId) {
                loadStatsFor(res.data[0].id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadStatsFor = async (id) => {
        setSelectedHabitId(id);
        try {
            const res = await getAdherence(id);
            setChartData(res.data.chartData || []);
            setAdherenceScore(res.data.adherenceScore || 0);
        } catch (error) {
            console.error(error);
            setChartData([]);
            setAdherenceScore(0);
        }
    };

    const handleSaveHabit = async (habitData) => {
        try {
            const res = await createHabit(habitData);
            setIsModalOpen(false);
            await loadHabits();
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
                if (remainingHabits.length > 0) {
                    loadStatsFor(remainingHabits[0].id);
                } else {
                    setSelectedHabitId(null);
                    setChartData([]);
                    setAdherenceScore(0);
                }
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
            await createLog(logData);
            // Refresh stats if the logged habit is the currently selected one
            if (selectedHabitId === habitId) {
                loadStatsFor(habitId);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full space-y-8 fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-1">
                        Tus Hábitos
                    </h1>
                    <p className="text-textMuted text-lg font-medium">Tus rachas determinan tus resultados.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-accent max-w-[220px] flex items-center justify-center gap-2">
                    <FiPlus size={20} /> Añadir Hábito
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Lateral: Lista de Hábitos */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4 text-textPrimary flex items-center gap-2">
                        <span className="w-2 h-6 rounded bg-primary dark:bg-white"></span>
                        Catálogo
                    </h2>
                    {habits.length === 0 ? (
                        <div className="text-textMuted text-base font-medium p-8 glass-card text-center bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                            No tienes hábitos. ¡Crea uno arriba!
                        </div>
                    ) : (
                        habits.map((habit) => (
                            <div 
                                key={habit.id} 
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
                            </div>
                        ))
                    )}
                </div>

                {/* Main: Gráficas de Adherencia */}
                <div className="lg:col-span-2">
                    {selectedHabitId ? (
                        <div className="glass-card dark:border-white/5 dark:bg-surface">
                            <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-primary dark:text-white mb-1">Métricas de Adherencia</h2>
                                    <p className="text-textMuted font-medium">Progreso de los últimos 30 días</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-success">{adherenceScore}%</span>
                                    <p className="text-sm font-bold text-textMuted uppercase tracking-wider">Tasa de Adherencia</p>
                                </div>
                            </div>
                            <AdherenceChart data={chartData} />
                        </div>
                    ) : (
                        <div className="glass-card flex items-center justify-center min-h-[300px] text-textMuted bg-gray-50/50 dark:bg-white/5 dark:border-white/5">
                            <p className="font-medium text-lg">Selecciona un hábito para visualizar su progreso.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Creación */}
            <AddHabitModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveHabit} 
            />
        </div>
    );
};

export default Dashboard;
