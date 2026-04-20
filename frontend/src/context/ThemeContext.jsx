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
        setIsDark(!isDark);
        // Disparar animación global de "Pop Out" al cambiar la capa entera
        document.body.classList.remove('theme-pop');
        void document.body.offsetWidth; // Force Reflow
        document.body.classList.add('theme-pop');
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
