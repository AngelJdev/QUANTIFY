import { Link } from 'react-router-dom';
import { FiMap, FiChevronRight } from 'react-icons/fi';

const Sitemap = () => {
    return (
        <div className="max-w-4xl w-full mx-auto fade-in">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-white/10 pb-6">
                <div className="bg-primary/10 dark:bg-white/5 p-3 rounded-xl border border-primary/20 dark:border-white/10">
                    <FiMap className="text-primary dark:text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold text-primary dark:text-white">
                    Mapa de Sitio
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card flex flex-col items-start hover:-translate-y-1 transition-transform">
                    <h2 className="text-xl font-bold text-textPrimary dark:text-white mb-4 border-l-4 border-accent dark:border-white pl-3">Público</h2>
                    <ul className="space-y-3 w-full">
                        <li>
                            <Link to="/login" className="flex items-center justify-between text-textMuted hover:text-primary dark:hover:text-white transition w-full p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                                <span>Acceso de Usuarios (Login)</span>
                                <FiChevronRight className="opacity-50" />
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" className="flex items-center justify-between text-textMuted hover:text-primary dark:hover:text-white transition w-full p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                                <span>Registro de Nuevos Usuarios</span>
                                <FiChevronRight className="opacity-50" />
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="glass-card flex flex-col items-start hover:-translate-y-1 transition-transform">
                    <h2 className="text-xl font-bold text-textPrimary dark:text-white mb-4 border-l-4 border-primary dark:border-white pl-3">Autenticado (Protegido)</h2>
                    <ul className="space-y-3 w-full">
                        <li>
                            <Link to="/dashboard" className="flex items-center justify-between text-textMuted hover:text-primary dark:hover:text-white transition w-full p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                                <span>Dashboard Principal</span>
                                <FiChevronRight className="opacity-50" />
                            </Link>
                        </li>
                        <li>
                            <Link to="/onboarding" className="flex items-center justify-between text-textMuted hover:text-primary dark:hover:text-white transition w-full p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                               <div className="flex flex-col">
                                    <span className="font-bold">Onboarding Wizard</span>
                                    <span className="text-[10px]">Cibermetría y Privacidad</span>
                               </div>
                                <FiChevronRight className="opacity-50" />
                            </Link>
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
