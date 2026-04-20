import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    if (pathnames.length === 0 || pathnames[0] === 'login' || pathnames[0] === 'register') return null;

    return (
        <nav className="flex px-2 py-4 mb-4 text-textMuted text-sm border-b border-gray-200 dark:border-gray-800 bg-transparent">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 w-full">
                <li className="inline-flex items-center">
                    <Link to="/dashboard" className="inline-flex items-center hover:text-primary transition-colors font-medium">
                        <FiHome className="mr-2" />
                        Dashboard
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    if (name === 'dashboard') return null;
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    
                    return (
                        <li key={name}>
                            <div className="flex items-center">
                                <FiChevronRight className="w-4 h-4 mr-2 opacity-50" />
                                {isLast ? (
                                    <span className="text-textPrimary capitalize font-bold">{name}</span>
                                ) : (
                                    <Link to={routeTo} className="hover:text-primary transition-colors capitalize font-medium">
                                        {name}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
