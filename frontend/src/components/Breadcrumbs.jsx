import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const Breadcrumbs = () => {
    const location = useLocation();
    const [history, setHistory] = useState([]);

    // Map of path to Label for better UX
    const routeLabels = {
        'dashboard': 'INICIO',
        'profile': 'MI PERFIL',
        'mapa-del-sitio': 'MAPA DEL SITIO',
        'soporte': 'SOPORTE TÉCNICO',
        'admin-panel': 'ADMINISTRACIÓN',
        'onboarding': 'BIENVENIDA',
        'settings': 'CONFIGURACIÓN'
    };

    useEffect(() => {
        const path = location.pathname;
        const segments = path.split('/').filter(x => x);
        
        // Don't track root, login or register
        if (path === '/' || segments[0] === 'login' || segments[0] === 'register') return;

        let storedHistory = JSON.parse(localStorage.getItem('breadcrumbs_history') || '[]');

        // If we are at dashboard, reset history
        if (path === '/dashboard') {
            const newHistory = [{ path: '/dashboard', label: 'INICIO' }];
            setHistory(newHistory);
            localStorage.setItem('breadcrumbs_history', JSON.stringify(newHistory));
            return;
        }

        // Logic to avoid duplicates and handle non-linear navigation
        const currentIndex = storedHistory.findIndex(item => item.path === path);
        
        if (currentIndex !== -1) {
            // If the path already exists, we go back in history to that point
            storedHistory = storedHistory.slice(0, currentIndex + 1);
        } else {
            // If it's a new path, add it
            const label = routeLabels[segments[segments.length - 1]] || segments[segments.length - 1].replace(/-/g, ' ').toUpperCase();
            storedHistory.push({ path, label });
        }

        // Limit history to 4 levels to keep it clean
        if (storedHistory.length > 4) {
            storedHistory = [storedHistory[0], ...storedHistory.slice(-3)];
        }

        setHistory(storedHistory);
        localStorage.setItem('breadcrumbs_history', JSON.stringify(storedHistory));
    }, [location.pathname]);

    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') return null;

    return (
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-8 bg-transparent border-b border-gray-200 dark:border-white/10 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            {history.map((item, index) => {
                const isLast = index === history.length - 1;
                const Icon = index === 0 ? FiHome : null;

                return (
                    <div key={item.path} className="flex items-center gap-2 flex-shrink-0">
                        {index > 0 && <FiChevronRight className="opacity-40 flex-shrink-0" />}
                        
                        {isLast ? (
                            <span className="text-primary dark:text-white flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                                {Icon && <Icon className="mb-0.5" />}
                                {item.label}
                            </span>
                        ) : (
                            <Link 
                                to={item.path} 
                                className="hover:text-primary dark:hover:text-white transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100"
                            >
                                {Icon && <Icon className="mb-0.5" />}
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
