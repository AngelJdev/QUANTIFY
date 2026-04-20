import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiActivity, FiSettings } from 'react-icons/fi';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <aside className="w-64 min-h-screen bg-primary dark:bg-background text-white hidden md:flex flex-col border-r border-black/20 dark:border-white/5 z-40 relative">
            {/* Logo Area */}
            <div className="p-8 border-b border-black/10 dark:border-white/5">
                <Link to="/dashboard" className="flex flex-col gap-2 items-start justify-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-surface p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-white/5">
                            <Logo className="w-8 h-8" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight dark:text-white">QUANTIFY</span>
                    </div>
                </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="flex-1 px-4 py-8 space-y-2">
                <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">Menú Principal</p>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-black/10 dark:bg-white/5 transition-colors font-bold text-sm shadow-inner dark:shadow-none border border-transparent dark:border-white/10 dark:text-white">
                    <FiActivity /> Dashboard
                </Link>
                {user.rol === 'ADMIN' && (
                    <span className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-not-allowed opacity-50 font-medium text-sm">
                        <FiSettings /> Panel de Control
                    </span>
                )}
            </div>

            {/* Profile & Logout */}
            <div className="p-6 border-t border-black/10 dark:border-white/5 bg-black/5 dark:bg-transparent">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-accent text-gray-900 rounded-full flex items-center justify-center font-black text-lg shadow-md border border-black/10">
                        {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-extrabold truncate dark:text-white">{user.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate font-medium">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ThemeToggle className="flex-none bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent dark:border-white/10 rounded-xl transition-all" />
                    <button 
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 bg-black/10 dark:bg-white/5 hover:bg-danger dark:hover:bg-danger text-white py-2.5 rounded-xl transition-all text-xs font-bold border border-transparent dark:border-white/10"
                        title="Cerrar Sesión"
                    >
                        <FiLogOut strokeWidth={2.5} /> Salir
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Navbar;
