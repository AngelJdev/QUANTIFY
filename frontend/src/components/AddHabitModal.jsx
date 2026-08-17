import { useState, useEffect, Fragment } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiDroplet, FiActivity, FiBook, FiSun, FiZap } from 'react-icons/fi';

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

export default function AddHabitModal({ isOpen, onClose, onSave }) {
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
    const [lastAiRecommendation, setLastAiRecommendation] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setNombre(''); setDescripcion(''); setMetaUnidad(''); setUnidadMedicion(''); setFrecuenciaMeta('DIARIO'); setDuracionTipo('1_MES'); setFechaFinPersonalizada('');
            setAiApplied(false);
            setAiGenerating(false);
            setLastAiRecommendation(null);
        }
    }, [isOpen]);

    // AI Prediction Engine (Simulated MVP)
    useEffect(() => {
        if (!nombre || nombre.length < 3) {
            setAiApplied(false);
            setLastAiRecommendation(null);
            return;
        }

        const timer = setTimeout(() => {
            const input = nombre.toLowerCase();
            const predict = (keywords, data) => keywords.some(k => input.includes(k)) ? data : null;

            const aiRecommendation = 
                predict(['gym', 'gimnasio', 'pesas', 'entrenar', 'ejercicio'], { frec: 'SEMANAL', meta: '5', uni: 'Días/Semana', dur: '1_MES', desc: 'Rutina de hipertrofia o fuerza constante.' }) ||
                predict(['agua', 'hidratacion', 'beber'], { frec: 'DIARIO', meta: '2.5', uni: 'Litros', dur: '1_MES', desc: 'Mantener hidratación óptima.' }) ||
                predict(['leer', 'lectura', 'libro'], { frec: 'DIARIO', meta: '20', uni: 'Páginas', dur: '6_MESES', desc: 'Desarrollo cognitivo y aprendizaje.' }) ||
                predict(['correr', 'running', 'trotar', 'cardio'], { frec: 'SEMANAL', meta: '3', uni: 'Días/Semana', dur: '1_MES', desc: 'Salud cardiovascular.' }) ||
                predict(['ingles', 'idioma', 'estudiar'], { frec: 'DIARIO', meta: '30', uni: 'Minutos', dur: '6_MESES', desc: 'Práctica constante del idioma.' }) ||
                predict(['meditar', 'yoga', 'mindful', 'respirar'], { frec: 'DIARIO', meta: '15', uni: 'Minutos', dur: '1_ANIO', desc: 'Reducción de estrés y enfoque.' }) ||
                predict(['dormir', 'sueño', 'descanso'], { frec: 'DIARIO', meta: '8', uni: 'Horas', dur: '1_MES', desc: 'Recuperación neuronal y muscular.' });

            if (aiRecommendation && lastAiRecommendation?.desc !== aiRecommendation.desc) {
                setAiGenerating(true);
                setTimeout(() => {
                    setFrecuenciaMeta(aiRecommendation.frec);
                    setMetaUnidad(aiRecommendation.meta);
                    setUnidadMedicion(aiRecommendation.uni);
                    setDuracionTipo(aiRecommendation.dur);
                    setDescripcion(aiRecommendation.desc);
                    setAiGenerating(false);
                    setAiApplied(true);
                    setLastAiRecommendation(aiRecommendation);
                }, 800); // Simulate AI thought process delay
            }
        }, 1000); // Debounce typing

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

    const handleSubmit = (e) => {
        e.preventDefault();
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
        if (nombre.trim()) onSave(habitData);
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
                                    
                                    {/* AI Minimalist Scanning Border Element */}
                                    <AnimatePresence>
                                        {aiGenerating && (
                                            <motion.div
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '200%' }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-0 left-0 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent z-50 shadow-[0_0_15px_rgba(var(--color-primary),0.8)] blur-[1px]"
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Header */}
                                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
                                        <Dialog.Title as="h2" className="text-2xl font-extrabold text-primary dark:text-white">Añadir Nuevo Hábito</Dialog.Title>
                                        <button onClick={onClose} className="text-textMuted hover:text-danger transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                            <FiX size={24} />
                                        </button>
                                    </div>

                                    {/* Form Body automatically scrolls natively */}
                                    <form id="add-habit-form" onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-textPrimary dark:text-gray-300 uppercase tracking-wider">Sugerencias Rápidas</label>
                                            <div className="flex flex-wrap gap-2">
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
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider flex justify-between w-full items-center">
                                                    <span>Nombre del Hábito</span>
                                                    <AnimatePresence mode="wait">
                                                        {aiGenerating && (
                                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-primary font-black flex items-center gap-1">
                                                                <FiZap className="animate-pulse" /> Cuantificando IA...
                                                            </motion.span>
                                                        )}
                                                        {aiApplied && !aiGenerating && (
                                                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-success font-black flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                                                <FiActivity size={10} /> Configuración Auto-Ajustada
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
                                                    className="input-field py-3 dark:bg-[#111111] dark:border-white/10 resize-none"
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
                                                        className="input-field py-3 dark:bg-[#111111] dark:border-white/10 appearance-none font-bold"
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
                                                        className="input-field py-3 dark:bg-[#111111] dark:border-white/10 appearance-none font-bold"
                                                    >
                                                        {DURATIONS.map(d => (
                                                            <option key={d.value} value={d.value} className="dark:bg-surface">{d.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/20 dark:border-white/10">
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
                                                        className="input-field py-3 bg-white dark:bg-[#0A0A0A] dark:border-white/20 w-full font-black text-primary dark:text-white text-lg"
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
                                                    <FiCheckCircle /> Resumen: El sistema te trackeará {metaUnidad} {unidadMedicion} durante {DURATIONS.find(d=>d.value===duracionTipo)?.label.toLowerCase()}.
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
                                        <button type="submit" form="add-habit-form" className="btn-primary flex items-center gap-2 px-8 py-2.5">
                                            <FiCheckCircle size={18} /> Confirmar Hábito
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
