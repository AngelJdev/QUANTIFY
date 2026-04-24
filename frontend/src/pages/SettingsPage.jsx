import { motion } from 'framer-motion';
import { FiSettings, FiBell, FiUser, FiLock } from 'react-icons/fi';
import { Link, Outlet } from 'react-router-dom';

const SettingsPage = () => {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configuración de Sistema</h1>
                <p className="text-textMuted">Administra los parámetros de tu cuenta y preferencias de interfaz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/dashboard/configuracion/perfil" className="glass-card hover:border-primary/50 transition-all group">
                    <FiUser className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-white">Perfil</h3>
                    <p className="text-xs text-textMuted">Información personal y avatar</p>
                </Link>
                <Link to="/dashboard/configuracion/notificaciones" className="glass-card hover:border-accent/50 transition-all group">
                    <FiBell className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-white">Notificaciones</h3>
                    <p className="text-xs text-textMuted">Alertas y recordatorios de hábitos</p>
                </Link>
                <div className="glass-card opacity-50 cursor-not-allowed">
                    <FiLock className="w-8 h-8 text-gray-500 mb-4" />
                    <h3 className="font-bold text-white text-gray-500">Seguridad</h3>
                    <p className="text-xs text-textMuted">Doble factor (Próximamente)</p>
                </div>
            </div>
            
            <div className="mt-8">
                <Outlet />
            </div>
        </div>
    );
};

export default SettingsPage;
