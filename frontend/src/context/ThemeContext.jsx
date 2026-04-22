import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Inicializar desde localStorage o preferir modo oscuro por defecto en MVP
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quantify-theme');
            return saved ? saved === 'dark' : false; // Por defecto empezamos con la Opción C: Light Mode
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('quantify-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('quantify-theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        if (!document.startViewTransition) {
            setIsDark(!isDark);
            return;
        }

        document.documentElement.classList.add('view-transition-ripple');
        
        const transition = document.startViewTransition(() => {
            setIsDark(!isDark);
        });

        transition.finished.finally(() => {
            document.documentElement.classList.remove('view-transition-ripple');
        });
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
