import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show on root or critical auth pages
    if (location.pathname === '/' || pathnames[0] === 'login' || pathnames[0] === 'register') return null;

    return (
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-8 bg-transparent border-b border-gray-200 dark:border-white/10 pb-4">
            <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 hover:text-primary dark:hover:text-white transition-colors"
            >
                <FiHome className="mb-0.5" />
                <span className="hidden sm:inline">INICIO</span>
            </Link>

            {pathnames.length > 0 && pathnames[0] !== 'dashboard' && (
                <>
                    <FiChevronRight className="opacity-40" />
                </>
            )}

            {pathnames.map((name, index) => {
                if (name === 'dashboard') return null;
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                
                const label = name.replace(/-/g, ' ');

                return (
                    <div key={name} className="flex items-center gap-2">
                        <FiChevronRight className="opacity-40" />
                        {isLast ? (
                            <span className="text-primary dark:text-white truncate max-w-[150px]">{label}</span>
                        ) : (
                            <Link to={routeTo} className="hover:text-primary dark:hover:text-white transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
