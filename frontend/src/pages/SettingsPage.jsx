import React from 'react';
import { FiSettings, FiBell, FiShield, FiMoon } from 'react-icons/fi';

const SettingsPage = () => {
    return (
        <div className="w-full space-y-8 fade-in">
            <header className="mb-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">Opciones del Sistema</h1>
                <p className="text-textMuted text-lg font-medium">Controla cada aspecto de tu plataforma.</p>
            </header>

            <div className="space-y-4 max-w-4xl">
                <div className="glass-card flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl"><FiBell size={24} /></div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Alertas Push</h3>
                            <p className="text-sm text-textMuted">Recibe notificaciones si te acercas al final del día sin registrar tus hábitos.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="glass-card flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><FiShield size={24} /></div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Cuenta Privada</h3>
                            <p className="text-sm text-textMuted">Ocultar mis estadísticas en las tablas de clasificación global.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                    </label>
                </div>

                <div className="glass-card flex items-center justify-between p-6 opacity-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-500/10 text-gray-500 rounded-xl"><FiMoon size={24} /></div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Modo Relajado (Zen)</h3>
                            <p className="text-sm text-textMuted">Ocultar rachas y puntajes para enfocarte sólo en el hoy. [Próximamente]</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
