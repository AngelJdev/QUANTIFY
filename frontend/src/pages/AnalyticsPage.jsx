import React from 'react';
import { FiPieChart, FiTrendingUp, FiActivity, FiMap } from 'react-icons/fi';

const AnalyticsPage = () => {
    return (
        <div className="w-full space-y-8 fade-in">
            <header className="mb-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">Analítica Avanzada</h1>
                <p className="text-textMuted text-lg font-medium">Bucea profundo en la matemática de tu comportamiento.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card flex flex-col items-center justify-center p-12 text-center h-[300px]">
                    <FiMap className="text-4xl text-primary/40 mb-4" />
                    <h3 className="text-xl font-bold text-textPrimary">Heatmap Anual</h3>
                    <p className="text-sm text-textMuted mt-2">Visualización estilo GitHub de tus contribuciones diarias. [Próximamente disponible]</p>
                </div>
                
                <div className="glass-card flex flex-col items-center justify-center p-12 text-center h-[300px]">
                    <FiPieChart className="text-4xl text-primary/40 mb-4" />
                    <h3 className="text-xl font-bold text-textPrimary">Correlación de Hábitos</h3>
                    <p className="text-sm text-textMuted mt-2">Descubre cómo dormir temprano influye en tu meditación al día siguiente. [A la espera de más datos]</p>
                </div>
                
                <div className="glass-card flex flex-col items-center justify-center p-12 text-center h-[300px] md:col-span-2">
                    <FiActivity className="text-4xl text-primary/40 mb-4" />
                    <h3 className="text-xl font-bold text-textPrimary">Biometría y Relojes</h3>
                    <p className="text-sm text-textMuted mt-2">Integración de frecuencia cardíaca con tasa de adherencia. Requiere sincronización prolongada del dispositivo wearable.</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
