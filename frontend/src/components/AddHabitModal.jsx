import { useState, useEffect, Fragment } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiDroplet, FiActivity, FiBook, FiSun, FiZap } from 'react-icons/fi';
import api from '../services/api';

const SUGGESTIONS = [
    { nombre: 'Tomar Agua', icono: FiDroplet, meta_diaria: 2, unidad: 'Litros', desc: 'Mantener la hidratación diaria' },
    { nombre: 'Caminar', icono: FiActivity, meta_diaria: 10, unidad: 'Kilómetros', desc: 'Salir a caminar y completar pasos' },
    { nombre: 'Leer', icono: FiBook, meta_diaria: 20, unidad: 'Páginas', desc: 'Fomentar el hábito de la lectura' },
    { nombre: 'Meditar', icono: FiSun, meta_diaria: 15, unidad: 'Minutos', desc: 'Meditación mindful para reducir el estrés' }
];

const DURATIONS = [
    { label: '1 Día', value: '1_DIA' },
    { label: '1 Semana', value: '1_SEMANA' },
    { label: '1 Mes', value: '1_MES' },
    { label: '6 Meses', value: '6_MESES' },
    { label: '1 Año', value: '1_ANIO' },
    { label: 'Personalizado', value: 'PERSONALIZADO' }
];

export default function AddHabitModal({ isOpen, onClose, onSave, isSmartMode = true }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [metaUnidad, setMetaUnidad] = useState('');
    const [unidadMedicion, setUnidadMedicion] = useState('');
    const [frecuenciaMeta, setFrecuenciaMeta] = useState('DIARIO');
    const [duracionTipo, setDuracionTipo] = useState('1_MES');
    const [fechaFinPersonalizada, setFechaFinPersonalizada] = useState('');

    // AI States
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiApplied, setAiApplied] = useState(false);
    const [aiJustApplied, setAiJustApplied] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [lastAiRecommendation, setLastAiRecommendation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setNombre(''); setDescripcion(''); setMetaUnidad(''); setUnidadMedicion(''); setFrecuenciaMeta('DIARIO'); setDuracionTipo('1_MES'); setFechaFinPersonalizada('');
            setAiApplied(false);
            setAiGenerating(false);
            setAiJustApplied(false);
            setAiError(null);
            setLastAiRecommendation(null);
        }
    }, [isOpen]);

    // REAL AI Prediction Engine via Backend Gemini SDK
    useEffect(() => {
        if (!isSmartMode) {
            setAiApplied(false);
            setAiError(null);
            setLastAiRecommendation(null);
            return;
        }

        if (!nombre || nombre.length < 3) {
            setAiApplied(false);
            setAiError(null);
            setLastAiRecommendation(null);
            return;
        }

        const timer = setTimeout(async () => {
            if (lastAiRecommendation?.desc && nombre.toLowerCase().includes(lastAiRecommendation.nombre_original)) {
                return; // Evitar llamadas redundantes si la recomendación no ha cambiado sustancialmente.
            }
            try {
                setAiGenerating(true);
                setAiError(null);
                const response = await api.post('/ai/recommend-habit', { query: nombre });

                if (response.data.success) {
                    const aiRecommendation = response.data.data;

                    if (aiRecommendation.ai_error) {
                        setAiError(aiRecommendation.ai_error);
                        return;
                    }

                    if (aiRecommendation && lastAiRecommendation?.desc !== aiRecommendation.desc) {
                        setFrecuenciaMeta(aiRecommendation.frec);
                        setMetaUnidad(aiRecommendation.meta);
                        setUnidadMedicion(aiRecommendation.uni);
                        setDuracionTipo(aiRecommendation.dur);
                        setDescripcion(aiRecommendation.desc);

                        setAiApplied(true);
                        setAiJustApplied(true);
                        setLastAiRecommendation({ ...aiRecommendation, nombre_original: nombre.toLowerCase() });

                        setTimeout(() => setAiJustApplied(false), 600); // Duración del destello
                    }
                }
            } catch (error) {
                console.error("AI Error:", error);
            } finally {
                setAiGenerating(false);
            }
        }, 1200); // 1.2s Debounce to avoid spamming the Gemini API

        return () => clearTimeout(timer);
    }, [nombre, lastAiRecommendation]);

    const handleSuggestionClick = (suggestion) => {
        setNombre(suggestion.nombre);
        setDescripcion(suggestion.desc);
        setMetaUnidad(suggestion.meta_diaria.toString());
        setUnidadMedicion(suggestion.unidad);
        setFrecuenciaMeta('DIARIO');
        setAiApplied(true); // Don't trigger AI on quick suggestions
    };

    const calculateEndDate = () => {
        if (duracionTipo === 'PERSONALIZADO') {
            return fechaFinPersonalizada ? new Date(fechaFinPersonalizada) : null;
        }
        const date = new Date();
        switch (duracionTipo) {
            case '1_DIA': date.setDate(date.getDate() + 1); break;
            case '1_SEMANA': date.setDate(date.getDate() + 7); break;
            case '1_MES': date.setMonth(date.getMonth() + 1); break;
            case '6_MESES': date.setMonth(date.getMonth() + 6); break;
            case '1_ANIO': date.setFullYear(date.getFullYear() + 1); break;
            default: return null;
        }
        return date;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const fechaFinObj = calculateEndDate();
            const habitData = {
                nombre,
                descripcion: descripcion || null,
                meta_diaria: metaUnidad ? parseFloat(metaUnidad) : null,
                unidad: unidadMedicion || null,
                frecuencia: frecuenciaMeta === 'MENSUAL' ? 'PERSONALIZADO' : frecuenciaMeta,
                duracion_tipo: duracionTipo,
                fecha_fin: fechaFinObj ? fechaFinObj.toISOString() : null,
            };
            if (nombre.trim()) await onSave(habitData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog static open={isOpen} onClose={onClose} className="relative z-[9999]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-xl transition-opacity"
                    />

                    {/* Modal Positioning */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Panel as={Fragment}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`relative w-full max-w-2xl bg-surface border rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-left align-middle max-h-[90vh] transition-colors duration-700 ${aiApplied ? 'border-success/50 box-shadow-success' : 'border-gray-200 dark:border-white/10'}`}
                                >
                                    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                                        <defs>
                                            <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#4285F4" />
                                                <stop offset="33%" stopColor="#EA4335" />
                                                <stop offset="66%" stopColor="#FBBC05" />
                                                <stop offset="100%" stopColor="#34A853" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {/* Header */}
                                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
                                        <Dialog.Title as="h2" className="text-xl md:text-2xl font-black text-textPrimary dark:text-white flex items-center gap-2">
                                            {isSmartMode ? ' Añadir Hábito Inteligente' : 'Añadir Hábito Manual'}
                                        </Dialog.Title>
                                        <button onClick={onClose} className="p-2 text-textMuted hover:text-textPrimary dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                                            <FiX size={24} />
                                        </button>
                                    </div>

                                    {/* Form Body automatically scrolls natively */}
                                    <form id="add-habit-form" onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-textPrimary dark:text-gray-300 uppercase tracking-wider">Sugerencias Rápidas</label>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {SUGGESTIONS.map((sug, i) => {
                                                    const Icon = sug.icono;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => handleSuggestionClick(sug)}
                                                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-gray-100 hover:bg-primary hover:text-white dark:bg-white/5 dark:hover:bg-white/20 transition-all border border-transparent dark:border-white/5 dark:text-gray-300"
                                                        >
                                                            {sug.nombre} <Icon size={14} className="opacity-70" />
                                                        </button>
                                                    );
                                                })}

                                                {/* Gemini Spinning Star Space */}
                                                <AnimatePresence>
                                                    {aiGenerating && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            className="ml-auto"
                                                        >
                                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_8px_rgba(66,133,244,0.5)] animate-[spin_4s_linear_infinite]">
                                                                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#gemini-gradient)" />
                                                            </svg>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider flex justify-between w-full items-center">
                                                    <span>Nombre del Hábito</span>
                                                    <AnimatePresence mode="wait">
                                                        {aiError && !aiGenerating && (
                                                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-danger font-black flex items-center gap-1 bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                                                {aiError}
                                                            </motion.span>
                                                        )}
                                                        {aiApplied && !aiGenerating && !aiError && (
                                                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-transparent bg-clip-text font-black flex items-center gap-1 bg-gradient-to-r from-[#4285F4] to-[#34A853] px-2 py-0.5 rounded-full border border-[#4285F4]/20 shadow-[0_0_10px_rgba(66,133,244,0.2)]">
                                                                Impulsado por Gemini
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </label>
                                                <input
                                                    required
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    className="input-field py-3 text-lg font-bold dark:bg-[#111111] dark:border-white/10"
                                                    placeholder="Ej. Leer 20 páginas diarias"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Descripción (Opcional)</label>
                                                <textarea
                                                    value={descripcion}
                                                    onChange={(e) => setDescripcion(e.target.value)}
                                                    rows={2}
                                                    className={`input-field py-3 resize-none transition-all duration-300 ${aiGenerating ? 'border-[#4285F4]/60 ring-2 ring-[#4285F4]/30 shadow-[0_0_15px_rgba(66,133,244,0.2)] bg-[#4285F4]/5' : aiJustApplied ? 'border-success ring-2 ring-success/50 bg-success/10 scale-[1.01]' : 'dark:bg-[#111111] dark:border-white/10 bg-white'}`}
                                                    placeholder="¿Por qué o cómo quieres lograrlo?"
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <h4 className="text-xs font-bold text-textPrimary dark:text-white uppercase tracking-wider mb-2">Configuración de la Meta</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Frecuencia / Tipo</label>
                                                    <select
                                                        value={frecuenciaMeta}
                                                        onChange={(e) => {
                                                            setFrecuenciaMeta(e.target.value);
                                                            if (e.target.value === 'SEMANAL') setUnidadMedicion('Días/Semana');
                                                            else if (e.target.value === 'MENSUAL') setUnidadMedicion('Días/Mes');
                                                            else setUnidadMedicion('');
                                                        }}
                                                        className={`input-field py-3 appearance-none font-bold transition-all duration-300 ${aiGenerating ? 'border-[#EA4335]/60 ring-2 ring-[#EA4335]/30 shadow-[0_0_15px_rgba(234,67,53,0.2)] bg-[#EA4335]/5' : aiJustApplied ? 'border-success ring-2 ring-success/50 bg-success/10 scale-[1.02]' : 'dark:bg-[#111111] dark:border-white/10 bg-white'}`}
                                                    >
                                                        <option value="DIARIO">Objetivo Diario</option>
                                                        <option value="SEMANAL">Objetivo Semanal</option>
                                                        <option value="MENSUAL">Objetivo Mensual</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Duración del Reto</label>
                                                    <select
                                                        value={duracionTipo}
                                                        onChange={(e) => setDuracionTipo(e.target.value)}
                                                        className={`input-field py-3 appearance-none font-bold transition-all duration-300 ${aiGenerating ? 'border-[#FBBC05]/60 ring-2 ring-[#FBBC05]/30 shadow-[0_0_15px_rgba(251,188,5,0.2)] bg-[#FBBC05]/5' : aiJustApplied ? 'border-success ring-2 ring-success/50 bg-success/10 scale-[1.02]' : 'dark:bg-[#111111] dark:border-white/10 bg-white'}`}
                                                    >
                                                        {DURATIONS.map(d => (
                                                            <option key={d.value} value={d.value} className="dark:bg-surface">{d.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${aiGenerating ? 'bg-gradient-to-r from-[#4285F4]/10 via-[#EA4335]/5 to-[#34A853]/10 border-[#34A853]/50 shadow-[0_0_20px_rgba(52,168,83,0.2)]' : aiJustApplied ? 'border-success ring-2 ring-success/30 bg-success/5 scale-[1.01]' : 'bg-primary/5 dark:bg-white/5 border-primary/20 dark:border-white/10'}`}>
                                                <div className="space-y-2 flex-1">
                                                    <label className="text-[10px] font-bold text-primary dark:text-gray-300 uppercase tracking-wider">
                                                        {frecuenciaMeta === 'SEMANAL' ? '¿Cuántos días a la semana?' :
                                                            frecuenciaMeta === 'MENSUAL' ? '¿Cuántos días al mes?' : 'Meta Numérica'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={metaUnidad}
                                                        onChange={(e) => setMetaUnidad(e.target.value)}
                                                        className={`input-field py-3 w-full font-black text-primary dark:text-white text-lg transition-all duration-300 ${aiGenerating ? 'bg-white/50 dark:bg-black/50 border-b-2 border-[#34A853]/50 animate-pulse' : aiJustApplied ? 'bg-success/20 text-success' : 'bg-white dark:bg-[#0A0A0A] dark:border-white/20'}`}
                                                        placeholder={frecuenciaMeta === 'SEMANAL' ? "Ej. 5" : "Ej. 2, 10, 20"}
                                                    />
                                                </div>
                                                <div className="space-y-2 flex-1 relative">
                                                    <label className="text-[10px] font-bold text-primary dark:text-gray-300 uppercase tracking-wider">Unidad de Medida</label>
                                                    <input
                                                        type="text"
                                                        value={unidadMedicion}
                                                        onChange={(e) => setUnidadMedicion(e.target.value)}
                                                        disabled={frecuenciaMeta !== 'DIARIO'}
                                                        className="input-field py-3 bg-white dark:bg-[#0A0A0A] dark:border-white/20 w-full font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                                                        placeholder="Litros, Km, Páginas..."
                                                    />
                                                    {frecuenciaMeta !== 'DIARIO' && (
                                                        <div className="absolute top-1 right-2 text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded uppercase font-black">Predefinido</div>
                                                    )}
                                                </div>
                                            </div>

                                            {(frecuenciaMeta === 'SEMANAL' || frecuenciaMeta === 'MENSUAL') && metaUnidad && (
                                                <div className="text-xs font-bold text-success flex items-center gap-2 px-2">
                                                    <FiCheckCircle /> Resumen: El sistema te trackeará {metaUnidad} {unidadMedicion} durante {DURATIONS.find(d => d.value === duracionTipo)?.label.toLowerCase()}.
                                                </div>
                                            )}
                                        </div>

                                        {duracionTipo === 'PERSONALIZADO' && (
                                            <div className="space-y-2 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Fecha Exacta de Finalización</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={fechaFinPersonalizada}
                                                    onChange={(e) => setFechaFinPersonalizada(e.target.value)}
                                                    className="input-field py-3 dark:bg-[#0A0A0A] dark:border-white/20"
                                                />
                                            </div>
                                        )}
                                    </form>

                                    {/* Footer */}
                                    <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-surface flex justify-end gap-3 shrink-0">
                                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-textMuted hover:text-textPrimary dark:hover:text-white transition-colors">
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            form="add-habit-form"
                                            disabled={isSubmitting || !!aiError}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-textPrimary hover:bg-white text-surface hover:text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <FiCheckCircle size={18} />
                                                    Confirmar Hábito
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
