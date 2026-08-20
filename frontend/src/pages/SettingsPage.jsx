import React from 'react';
import { FiBell, FiShield, FiMoon, FiLock, FiDownload, FiTrash2 } from 'react-icons/fi';

const SettingsPage = () => {
    return (
        <div className="w-full space-y-8 fade-in pb-12">
            <header className="mb-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">Opciones del Sistema</h1>
                <p className="text-textMuted text-lg font-medium">Controla cada aspecto de tu plataforma.</p>
            </header>

            <div className="space-y-8 max-w-4xl">
                {/* Configuraciones Básicas Activas */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Gestión de Cuenta</h2>

                    <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><FiLock size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Cambiar Contraseña</h3>
                                <p className="text-sm text-textMuted">Ruta segura para actualizar credenciales.</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-background dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm text-primary dark:text-white hover:bg-primary/5 dark:hover:bg-white/5 transition-colors w-full sm:w-auto">
                            Modificar
                        </button>
                    </div>

                    <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><FiDownload size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Exportar Mis Datos</h3>
                                <p className="text-sm text-textMuted">Descarga tu telemetría en formato CSV.</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-background dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm text-primary dark:text-white hover:bg-primary/5 dark:hover:bg-white/5 transition-colors w-full sm:w-auto">
                            Descargar
                        </button>
                    </div>

                    <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-danger/30 hover:border-danger transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-danger/10 text-danger rounded-xl"><FiTrash2 size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg text-danger">Eliminar Cuenta</h3>
                                <p className="text-sm text-textMuted">Borra permanentemente datos y perfil.</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-danger/10 text-danger border border-danger/20 rounded-xl font-bold text-sm hover:bg-danger hover:text-white transition-colors w-full sm:w-auto">
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Opciones Próximamente */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Privacidad y Alertas</h2>
                    
                    <div className="glass-card flex items-center justify-between p-6 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl"><FiBell size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Alertas Push</h3>
                                <p className="text-sm text-textMuted">Notificaciones al final del día. [Próximamente]</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card flex items-center justify-between p-6 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><FiShield size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Cuenta Privada</h3>
                                <p className="text-sm text-textMuted">Ocultar estadísticas en tablas. [Próximamente]</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card flex items-center justify-between p-6 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-500/10 text-gray-500 rounded-xl"><FiMoon size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Modo Relajado (Zen)</h3>
                                <p className="text-sm text-textMuted">Ocultar rachas. [Próximamente]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
