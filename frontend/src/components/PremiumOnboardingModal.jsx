import { useState, Fragment, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiZap, FiActivity, FiAward, FiEdit3, FiTrendingUp } from 'react-icons/fi';
import Logo from './Logo';

export default function PremiumOnboardingModal({ isOpen, onClose, onUpgrade, initialStep = 0 }) {
    const [step, setStep] = useState(initialStep);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            setIsPurchasing(false);
        }
    }, [isOpen, initialStep]);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        // Immersive dramatic loading explicitly requested by user (6s progression to gold)
        await new Promise(r => setTimeout(r, 6000));
        await onUpgrade();
        await new Promise(r => setTimeout(r, 500)); // Show UI updated before closing
        // Do NOT set isPurchasing to false here, or the old UI background flashes before it fully unfades. 
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog 
                    as={motion.div} 
                    static 
                    open={isOpen} 
                    onClose={() => {}} 
                    className="relative z-[9999]"
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <AnimatePresence>
                            {isPurchasing && (
                                <motion.div 
                                    key="fullscreen_purchasing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.6 }}
                                    className="fixed inset-0 z-[99999] w-screen h-screen bg-[#0d0d0d] flex flex-col items-center justify-center overflow-hidden"
                                >
                                    {/* Fullscreen Radial Glow Backdrop */}
                                    <motion.div 
                                        className="absolute inset-0 opacity-10"
                                        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                                        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                        style={{ backgroundImage: "radial-gradient(circle at center, #F59E0B 0%, transparent 60%)", backgroundSize: "200% 200%" }}
                                    />

                                    {/* Logo Scaling Fullscreen */}
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 2, 2.5],
                                            rotate: [0, 5, -5, 0],
                                            color: ["#9CA3AF", "#FCD34D", "#F59E0B", "#F59E0B"],
                                            filter: [
                                                "drop-shadow(0px 0px 0px transparent)", 
                                                "drop-shadow(0px 0px 40px rgba(245,158,11,0.5))", 
                                                "drop-shadow(0px 0px 100px rgba(245,158,11,1))"
                                            ]
                                        }} 
                                        transition={{ duration: 5, ease: "easeInOut" }}
                                        className="relative z-10 mb-12"
                                    >
                                        <Logo className="w-24 h-24" style={{ color: 'inherit' }} />
                                    </motion.div>
                                    
                                    {/* Title Text */}
                                    <motion.h2 
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        className="relative z-10 text-3xl md:text-4xl font-black text-amber-500 uppercase tracking-[0.3em] mb-6 drop-shadow-2xl"
                                    >
                                        QUANTIFY PRO
                                    </motion.h2>

                                    {/* Loading Bar */}
                                    <div className="w-2/3 max-w-[300px] h-1.5 bg-gray-900 rounded-full overflow-hidden relative z-10">
                                        <motion.div 
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5.5, ease: "easeInOut" }}
                                            className="h-full bg-amber-500 shadow-[0_0_15px_#F59E0B]"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Dialog.Panel as={Fragment}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                                transition={{ duration: 0.4 }}
                                className="relative w-full max-w-lg min-h-[500px] flex flex-col justify-center bg-surface border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                            >
                                {/* Paginator Dots */}
                                {!isPurchasing && (
                                    <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-20">
                                        {[0, 1, 2, 3].map((idx) => (
                                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${step === idx ? 'w-6 bg-primary dark:bg-white' : 'w-2 bg-gray-300 dark:bg-white/20'}`} />
                                        ))}
                                    </div>
                                )}

                                {/* Step 0: Welcome */}
                                {step === 0 && (
                                    <div className="pt-16 pb-8 px-8 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-primary/20">
                                            <Logo className="w-10 h-10 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-black text-textPrimary dark:text-white mb-4">Ingeniería de Hábitos</h2>
                                        <p className="text-textMuted dark:text-gray-400 mb-8 leading-relaxed">
                                            Bienvenido a <strong>QUANTIFY</strong>. No somos un simple block de notas; somos el centro de control para medir tu evolución personal con métricas precisas.
                                        </p>
                                        <button onClick={handleNext} className="w-full btn-primary py-4 rounded-xl font-bold text-lg">
                                            Aprender a usarlo
                                        </button>
                                    </div>
                                )}

                                {/* Step 1: Creación y Medición */}
                                {step === 1 && (
                                    <div className="pt-16 pb-8 px-8 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                                            <FiEdit3 size={35} className="text-success" />
                                        </div>
                                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-success to-emerald-400 mb-4">
                                            1. Crea y Cuantifica
                                        </h2>
                                        <div className="text-left bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 mb-8 w-full">
                                            <ul className="space-y-4 text-sm text-textMuted dark:text-gray-300">
                                                <li className="flex gap-3"><FiCheckCircle className="text-success shrink-0 mt-0.5" /> Utiliza el botón <strong>Hábito Manual</strong> para definir tu objetivo.</li>
                                                <li className="flex gap-3"><FiActivity className="text-success shrink-0 mt-0.5" /> En tu Catálogo, haz click en el icono verde <FiCheckCircle className="inline" /> todos los días para <strong>Registrar Adherencia</strong>.</li>
                                            </ul>
                                        </div>
                                        <button onClick={handleNext} className="w-full btn-primary py-4 rounded-xl font-bold text-lg !bg-success hover:!bg-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)] border-none">
                                            Siguiente
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Gamificación (XP) */}
                                {step === 2 && (
                                    <div className="pt-16 pb-8 px-8 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 relative">
                                            <FiAward size={35} className="text-orange-400" />
                                            <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-surface flex items-center gap-1">
                                                <FiZap size={8} /> +10 XP
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-4">
                                            2. Sube de Nivel
                                        </h2>
                                        <div className="text-left bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 mb-8 w-full">
                                            <ul className="space-y-4 text-sm text-textMuted dark:text-gray-300">
                                                <li className="flex gap-3"><FiTrendingUp className="text-orange-400 shrink-0 mt-0.5" /> Tu perfil funciona como un RPG. Cada hábito que completes te otorgará <strong>+10 de XP Histórico</strong>.</li>
                                                <li className="flex gap-3"><FiZap className="text-orange-400 shrink-0 mt-0.5" /> Junta 100 XP para subir de <strong>Nivel Global</strong>. Acumular rachas te acercará a recompensas exclusivas.</li>
                                            </ul>
                                        </div>
                                        <button onClick={handleNext} className="w-full btn-primary py-4 rounded-xl font-bold text-lg !bg-orange-500 hover:!bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)] border-none text-white">
                                            Descubrir lo Último
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="relative pt-12 pb-8 px-8 text-center flex flex-col items-center h-full bg-gradient-to-br from-surface to-surface">
                                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
                                        
                                        <div className="w-full flex md:contents flex-col items-center">
                                            <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white/10 dark:to-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-xl ring-4 ring-black/5 dark:ring-white/10 text-white border border-gray-600 dark:border-white/20">
                                                <Logo className="w-12 h-12 drop-shadow-md text-white" />
                                            </div>
                                            <h2 className="relative z-10 text-3xl font-black text-textPrimary dark:text-white mb-2 tracking-tight">Desbloquea QUANTIFY Pro</h2>
                                            <p className="relative z-10 font-black text-xl mb-6 text-primary">
                                                $99 MXN <span className="text-sm font-medium text-textMuted dark:text-gray-500">/ mensual</span>
                                            </p>
                                            
                                            <div className="w-full space-y-3 mb-8 text-left relative z-10 bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <FiCheckCircle className="text-primary w-4 h-4" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-textPrimary dark:text-gray-200">Inteligencia Artificial Gemini Ilimitada</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <FiCheckCircle className="text-primary w-4 h-4" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-textPrimary dark:text-gray-200">Asistente Generador de Rutinas</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-orange-400/20 flex items-center justify-center shrink-0">
                                                        <FiZap className="text-orange-400 w-4 h-4" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-textPrimary dark:text-gray-200">Nuevas Estéticas Exclusivas</span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full flex flex-col gap-3 relative z-10">
                                                <button 
                                                    onClick={handlePurchase} 
                                                    className="w-full btn-primary py-4 rounded-xl font-black text-lg bg-textPrimary dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-none shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                                >
                                                    Obtener Premium Ahora
                                                </button>
                                                <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-textPrimary dark:hover:text-white transition-colors bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                                    Continuar con la versión gratuita
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
