import { Link } from 'react-router-dom';
import { FiMap } from 'react-icons/fi';

const Sitemap = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 fade-in">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
                <FiMap className="text-secondary w-8 h-8" />
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Mapa de Sitio
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-primary pl-3">Público</h2>
                    <ul className="space-y-3">
                        <li>
                            <Link to="/login" className="text-textMuted hover:text-primary transition">Acceso de Usuarios (Login)</Link>
                        </li>
                        <li>
                            <Link to="/register" className="text-textMuted hover:text-primary transition">Registro de Nuevos Usuarios</Link>
                        </li>
                    </ul>
                </div>

                <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-secondary pl-3">Autenticado (Protegido)</h2>
                    <ul className="space-y-3">
                        <li>
                            <Link to="/dashboard" className="text-textMuted hover:text-primary transition">Dashboard Principal (Métricas y Hábitos)</Link>
                        </li>
                        <li>
                            <Link to="/sitemap" className="text-textMuted hover:text-primary transition">Directorio de Recursos (Sitemap)</Link>
                        </li>
                        <li className="opacity-50">
                            <span className="text-textMuted cursor-not-allowed">Panel de Administración (Roles ADMIN)</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-12">
                Arquitectura de Rutas Dinámicas - Quantify MVP
            </p>
        </div>
    );
};

export default Sitemap;
