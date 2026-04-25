# QUANTIFY - High-End Frontend Interface

<div align="center">
  <img src="https://img.shields.io/badge/Library-React_v18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Build_Tool-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Design-Engineering_Aesthetic-black?style=for-the-badge" />
</div>

---

### FILOSOFÍA DE DISEÑO
La interfaz de Quantify ha sido diseñada bajo el concepto de **Engineering Aesthetic**. No buscamos solo una app "bonita", sino una herramienta que transmita precisión, control y tecnología.
- **Glassmorphism**: Uso de capas translúcidas para dar profundidad.
- **Dark Mode Native**: Optimizado para reducir la fatiga visual y resaltar datos críticos.
- **Micro-interacciones**: Animaciones fluidas que proporcionan feedback inmediato al usuario.

---

### COMPONENTES DESTACADOS

#### Breadcrumbs Inteligentes
Sistema de navegación dinámico que utiliza `localStorage` para mantener el historial de navegación incluso después de recargar la página. Permite un flujo de trabajo fluido entre el Dashboard y las vistas de administración.

#### Dashboard de Analítica
- **Recharts Integration**: Visualización de adherencia semanal y performance global.
- **Habit Insights**: Tarjetas inteligentes que analizan tendencias de racha en tiempo real.

#### Trophy Gallery
Gama de logros visuales que se desbloquean dinámicamente según las respuestas del motor de gamificación del backend.

---

### STACK TÉCNICO
- **Framework**: React.js (Vite)
- **Estilos**: CSS nativo con variables de diseño globales.
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Iconografía**: React Icons (Fi, Md, Io)
- **Gráficas**: [Recharts](https://recharts.org/)

---

### GUÍA DE DESARROLLO
1. Instalar dependencias: `npm install`
2. Configurar el endpoint del API en `src/services/api.js`.
3. Iniciar servidor de desarrollo: `npm run dev`
4. Build de producción: `npm run build`

---

### MAPA DEL SITIO
- `/dashboard`: Panel central de hábitos y estadísticas.
- `/profile`: Gestión de biometría y cuenta.
- `/admin`: Panel de control total (solo para administradores).
- `/support`: Centro de ayuda y reporte de bugs.
