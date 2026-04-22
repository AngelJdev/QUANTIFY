import { useState, useEffect, Fragment } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiDroplet, FiActivity, FiBook, FiSun } from 'react-icons/fi';

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
    const [duracionTipo, setDuracionTipo] = useState('1_MES');
    const [fechaFinPersonalizada, setFechaFinPersonalizada] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setNombre(''); setDescripcion(''); setMetaUnidad(''); setUnidadMedicion(''); setDuracionTipo('1_MES'); setFechaFinPersonalizada('');
        }
    }, [isOpen]);

    const handleSuggestionClick = (suggestion) => {
        setNombre(suggestion.nombre);
        setDescripcion(suggestion.desc);
        setMetaUnidad(suggestion.meta_diaria.toString());
        setUnidadMedicion(suggestion.unidad);
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
                                    className="relative w-full max-w-2xl bg-surface border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-left align-middle max-h-[90vh]"
                                >
                                    
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
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Nombre del Hábito</label>
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex gap-2">
                                                <div className="space-y-2 w-1/2">
                                                    <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Meta Numérica</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={metaUnidad}
                                                        onChange={(e) => setMetaUnidad(e.target.value)}
                                                        className="input-field py-3 dark:bg-[#111111] dark:border-white/10 w-full"
                                                        placeholder="Ej. 10, 20"
                                                    />
                                                </div>
                                                <div className="space-y-2 w-1/2">
                                                    <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Unidad de Medida</label>
                                                    <input
                                                        type="text"
                                                        value={unidadMedicion}
                                                        onChange={(e) => setUnidadMedicion(e.target.value)}
                                                        className="input-field py-3 dark:bg-[#111111] dark:border-white/10 w-full"
                                                        placeholder="Litros, Km..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-textPrimary dark:text-gray-400 uppercase tracking-wider">Duración Total</label>
                                                <select 
                                                    value={duracionTipo}
                                                    onChange={(e) => setDuracionTipo(e.target.value)}
                                                    className="input-field py-3 dark:bg-[#111111] dark:border-white/10 appearance-none"
                                                >
                                                    {DURATIONS.map(d => (
                                                        <option key={d.value} value={d.value} className="dark:bg-surface">{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>
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
