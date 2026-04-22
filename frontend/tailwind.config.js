/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Habilita modo oscuro basado en clases de HTML
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          background: 'var(--color-background)',
          surface: 'var(--color-surface)',
          success: 'var(--color-success)',
          goal: 'var(--color-goal)',
          danger: 'var(--color-danger)',
          textPrimary: 'var(--color-textPrimary)',
          textMuted: 'var(--color-textMuted)'
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
