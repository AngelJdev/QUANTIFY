import React from 'react';
import { FiUsers, FiGlobe, FiAward } from 'react-icons/fi';

const CommunityPage = () => {
    return (
        <div className="w-full space-y-8 fade-in">
            <header className="mb-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">Comunidad y Desafíos</h1>
                <p className="text-textMuted text-lg font-medium">Compite o colabora con otros Quantifiers.</p>
            </header>

            <div className="glass-card p-8 text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 rotate-3">
                    <FiGlobe size={40} />
                </div>
                <h2 className="text-2xl font-black text-textPrimary mb-4">La Arena Global</h2>
                <p className="text-textMuted max-w-xl mx-auto mb-8 font-medium">
                    Ingresa a la tabla de clasificación mundial para reclamar tu lugar en el top 1% de disciplina y constancia. Pronto podrás invitar a tus amigos a retos personalizados.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="btn-accent px-8 py-3 disabled opacity-50 cursor-not-allowed">Crear Grupo Privado</button>
                    <button className="px-8 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Ver Leaderboard</button>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
