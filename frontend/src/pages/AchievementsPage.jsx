import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrendingUp, FiLock } from 'react-icons/fi';

const AchievementsPage = () => {
    return (
        <div className="w-full space-y-8 fade-in">
            <header className="mb-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">Logros y Títulos</h1>
                <p className="text-textMuted text-lg font-medium">Reclama recompensas exclusivas por demostrar consistencia impecable.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex flex-col justify-between h-48 border-amber-400/50 bg-amber-400/10">
                    <div className="flex justify-between items-start">
                        <div className="bg-amber-400 text-white p-3 rounded-full">
                            <FiStar size={24} />
                        </div>
                        <span className="text-xs font-bold bg-amber-400/20 text-amber-600 px-3 py-1 rounded-full uppercase tracking-wider">Desbloqueado</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-amber-600 dark:text-amber-400">Pionero</h3>
                        <p className="text-sm font-medium text-amber-700/70 dark:text-amber-400/70 mt-1">Completa tu primer hábito del sistema.</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex flex-col justify-between h-48 opacity-70">
                    <div className="flex justify-between items-start">
                        <div className="bg-gray-300 dark:bg-gray-700 text-gray-500 p-3 rounded-full">
                            <FiTrendingUp size={24} />
                        </div>
                        <FiLock className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-600 dark:text-gray-300">Titanio Semanal</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Completa todos tus hábitos por 7 días seguidos.</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-gray-400 h-full w-[40%]"></div>
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex flex-col justify-between h-48 opacity-70">
                    <div className="flex justify-between items-start">
                        <div className="bg-gray-300 dark:bg-gray-700 text-gray-500 p-3 rounded-full">
                            <FiAward size={24} />
                        </div>
                        <FiLock className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-600 dark:text-gray-300">Dios del Reloj</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Sincroniza un smartwatch más de 30 días.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AchievementsPage;
