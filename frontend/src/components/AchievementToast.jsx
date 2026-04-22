import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiX } from 'react-icons/fi';
import { useEffect } from 'react';

export default function AchievementToast({ achievement, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 8000); // Auto close after 8s
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                className="fixed bottom-10 right-6 md:right-12 z-[10000] w-full max-w-sm"
            >
                <div className="bg-surface dark:bg-[#111111] border border-accent/30 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(6,182,212,0.3)] overflow-hidden relative group">
                    {/* Glowing effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div className="relative p-6 bg-surface dark:bg-[#111111] flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                            <FiAward size={36} className="animate-bounce" />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">¡Nuevo Logro Desbloqueado!</span>
                                <h4 className="text-lg font-black text-textPrimary dark:text-white leading-tight">{achievement.titulo}</h4>
                                <p className="text-xs text-textMuted dark:text-gray-400 mt-1 line-clamp-2 md:line-clamp-none">
                                    {achievement.descripcion}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-textMuted hover:text-textPrimary dark:hover:text-white transition-colors p-1"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Progress bar timer */}
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-1 bg-accent absolute bottom-0 left-0"
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
