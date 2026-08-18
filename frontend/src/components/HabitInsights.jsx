import { useEffect, useState } from 'react';
import { FiTrendingUp as Up, FiTrendingDown as Down, FiActivity as Act, FiAlertCircle as Alert, FiCompass } from 'react-icons/fi';
import api from '../services/api';
import { motion } from 'framer-motion';

const HabitInsights = ({ adherenceScore, tendenciaSemanal }) => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const recRes = await api.get('/onboarding/recommendations');
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
        Icon = Up;
        bgColorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    } else if (adherenceScore >= 50) {
        message = "Progreso constante. Un pequeño esfuerzo más te llevará al nivel óptimo.";
        Icon = Act;
        bgColorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    } else if (adherenceScore > 0) {
        message = "La racha ha disminuido. Recupera el enfoque hoy mismo.";
        Icon = Alert;
        bgColorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }

    const isTrendPositive = tendenciaSemanal >= 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adherence Card */}
                <div className={`p-6 rounded-2xl border ${bgColorClass} flex items-start justify-between`}>
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider opacity-75">Análisis de Fase</h4>
                        <p className="font-bold text-base leading-snug">{message}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-black/20 rounded-full shrink-0 shadow-sm">
                        <Icon size={20} />
                    </div>
                </div>

                {/* Trend Card */}
                <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-start justify-between">
                    <div className="space-y-1">
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
                <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                    <h3 className="text-xs font-black text-textMuted dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FiCompass /> Sugerencias de Ingeniería Bio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl space-y-1">
                                <h4 className="font-bold text-xs text-textPrimary dark:text-white flex items-center gap-2">
                                    {rec.nombre} 
                                    <span className="text-[9px] font-black bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">Bio-Optimized</span>
                                </h4>
                                <p className="text-xs text-textMuted dark:text-gray-400 mt-0.5">{rec.descripcion}</p>
                                <div className="pt-2 flex items-center gap-2">
                                    <span className="text-base font-black text-primary dark:text-accent">{rec.meta_diaria}</span>
                                    <span className="text-[10px] font-bold text-textMuted uppercase">{rec.unidad}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitInsights;
