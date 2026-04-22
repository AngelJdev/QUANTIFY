import { useEffect, useState } from 'react';
import { FiTrendingUp as Up, FiTrendingDown as Down, FiActivity as Act, FiAlertCircle as Alert, FiAward as Award, FiStar, FiCompass } from 'react-icons/fi';
import { getAchievements } from '../services/habitService';
import api from '../services/api';
import { motion } from 'framer-motion';

const HabitInsights = ({ adherenceScore, tendenciaSemanal }) => {
    const [achievements, setAchievements] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const [achRes, recRes] = await Promise.all([
                    getAchievements(),
                    api.get('/onboarding/recommendations')
                ]);
                setAchievements(achRes.data.achievements || []);
                setRecommendations(recRes.data.recommendations || []);
            } catch (err) {
                console.error("Error al cargar insights de Quantify", err);
            }
        };
        fetchInsights();
    }, []);

    let message = "Mantén el ritmo, la constancia es clave.";
    let Icon = Act;
    let bgColorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";

    if (adherenceScore >= 80) {
        message = "¡Excelente! Estás en la fase de consolidación del hábito.";
        Icon = Award;
        bgColorClass = "bg-success/10 text-success border-success/20";
    } else if (adherenceScore < 50) {
        message = "Fase crítica: Intenta reducir la fricción del hábito para mejorar la consistencia.";
        Icon = Alert;
        bgColorClass = "bg-danger/10 text-danger border-danger/20";
    }

    const isTrendPositive = tendenciaSemanal >= 0;

    return (
        <div className="mt-6 flex flex-col gap-8 w-full">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Adherence Phase */}
                <div className={`flex-1 flex items-start gap-4 p-5 rounded-2xl border ${bgColorClass} dark:shadow-none shadow-sm transition-all fade-in bg-surface dark:bg-transparent`}>
                    <div className="p-3 bg-white dark:bg-black/20 rounded-xl shrink-0 shadow-sm">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">Análisis de Fase</h4>
                        <p className="text-sm font-medium opacity-90">{message}</p>
                    </div>
                </div>

                {/* Growth Trend */}
                <div className={`md:w-64 flex items-start justify-between gap-4 p-5 rounded-2xl border ${isTrendPositive ? 'bg-success/5 text-success border-success/10' : 'bg-orange-500/5 text-orange-500 border-orange-500/10'} shadow-sm fade-in bg-surface dark:bg-transparent`}>
                    <div>
                        <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1 text-textPrimary dark:text-gray-300">Tendencia WoW</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black">{isTrendPositive ? '+' : ''}{tendenciaSemanal}%</span>
                        </div>
                        <p className="text-xs font-medium opacity-70 mt-1">vs semana anterior</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-black/20 rounded-full shrink-0 shadow-sm mt-1">
                        {isTrendPositive ? <Up size={20} /> : <Down size={20} />}
                    </div>
                </div>
            </div>

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-sm font-black text-textMuted dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FiCompass className="animate-spin-slow" /> Sugerencias de Ingeniería Bio
                    </h3>
                    <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="p-4 bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h5 className="font-bold text-textPrimary dark:text-white flex items-center gap-2">
                                        {rec.nombre} 
                                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">Bio-Optimized</span>
                                    </h5>
                                    <p className="text-xs text-textMuted dark:text-gray-400 mt-0.5">{rec.descripcion}</p>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <span className="text-lg font-black text-primary dark:text-accent">{rec.meta_diaria}</span>
                                    <span className="text-[10px] font-bold text-textMuted uppercase">{rec.unidad}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Galería de Trofeos */}
            {achievements.length > 0 && (
                <div className="pt-8 border-t border-gray-100 dark:border-white/10">
                    <h3 className="text-xl font-black text-textPrimary dark:text-white mb-6 flex items-center gap-2">
                        <FiStar className="text-accent" /> Galería de Trofeos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((achievement, idx) => (
                            <motion.div 
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-surface dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:border-accent/40 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-accent to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-accent/10 group-hover:scale-110 transition-transform">
                                    {achievement.icono_url || '🏆'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-textPrimary dark:text-white truncate">{achievement.titulo}</h4>
                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none">{achievement.mes_logro}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitInsights;
