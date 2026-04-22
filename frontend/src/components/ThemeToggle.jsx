import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = "" }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all active:scale-75 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-amber-500 dark:text-yellow-400 border border-gray-300 dark:border-gray-700 shadow-sm ${className}`}
            title={`Cambiar a modo ${isDark ? 'Claro' : 'Oscuro'}`}
        >
            {isDark ? <FiSun size={20} className="animate-spin-slow" /> : <FiMoon size={20} className="animate-pulse" />}
        </button>
    );
};

export default ThemeToggle;
