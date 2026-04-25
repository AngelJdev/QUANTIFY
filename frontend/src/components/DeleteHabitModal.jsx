import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DeleteHabitModal = ({ isOpen, onClose, onConfirm, habitName }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card max-w-md w-full p-8 border-t-4 border-t-red-500 shadow-2xl relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
                    >
                        <FiX size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                            <FiAlertTriangle size={32} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                ¿Eliminar Hábito?
                            </h2>
                            <p className="text-textMuted font-medium leading-relaxed px-4">
                                Estás a punto de borrar <span className="text-white font-bold">"{habitName}"</span>. 
                                Esta acción eliminará permanentemente todos los registros y rachas asociadas.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/40 transition-all active:scale-95 border border-red-400/20"
                            >
                                Eliminar Ahora
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeleteHabitModal;
