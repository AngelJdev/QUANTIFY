import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    return (
        <motion.nav 
            variants={{
                visible: { y: 0 },
                hidden: { y: -100 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 w-full h-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 md:px-12 z-[100]"
        >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-primary p-1.5 rounded-xl text-white shadow-lg shadow-primary/20 dark:bg-white dark:text-black">
                    <Logo className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-primary dark:text-white">QUANTIFY</span>
            </Link>

            {/* Smart Navigation */}
            <div className="flex items-center gap-4">
                <ThemeToggle className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10" />
                
                {isAuthenticated && user ? (
                    <div className="flex items-center gap-4 border-l border-gray-200 dark:border-white/10 pl-4 ml-2">
                        {/* Streak Counter */}
                        <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-500/20 shadow-sm shadow-orange-500/5">
                            <FiZap className="text-orange-500 text-lg" />
                            <span className="text-sm font-black text-orange-600 dark:text-orange-400">66</span>
                        </div>

                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-primary dark:text-white">{user.nombre}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest dark:text-gray-400">Usuario Verificado</p>
                        </div>
                        <div className="w-10 h-10 bg-accent text-gray-900 rounded-full flex items-center justify-center font-black text-lg shadow-md border border-black/10">
                            {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-primary dark:bg-white text-surface dark:text-black font-black py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 dark:shadow-white/5 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                        >
                            Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-4 ml-2">
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary dark:bg-white text-surface dark:text-black font-black py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 dark:shadow-white/5 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
