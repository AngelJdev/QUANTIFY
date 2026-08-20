# Interfaz de Usuario e Integración Cliente (React + Vite)

El repositorio subyacente para el front-end es una SPA (Single Page Application) enfocada al rendimiento, gestion de estado asincrono y representación gráfica de datos provenientes del framework arquitectónico de QUANTIFY.

## 1. Patrón Visual: Engineering Aesthetic
Inspirado por interfaces aeronáuticas, monitores biométricos profesionales e interfaces IDE industriales puro. Todo el layout depende de esquemas de oscuridad profunda, alto contraste por líneas divisorias de 1px (borders), topografía purista (sans-serif tipo JetBrains o Inter) y total erradicación de componentes curvos innecesarios bajo estándares de TailwindCSS. Cero desorden, 100% legibilidad técnica.

## 2. Tecnologías y Herramientas Base
- **React (Core)**: Inicia renderizado de componentes funcionales e inmutabilidad de estados usando `useState`, `useEffect` e interceptores de red.
- **Vite (Bundler)**: Compilador Next-Gen (esbuild). Se seleccionó sobre Webpack o CRA por la latencia cero requerida por la velocidad del reloj operativo durante el proceso de desarrollo e integración de los analíticos de BI (Business Intelligence).
- **Socket.IO-Client**: Encargado de sostener conexiones persistentes (TCP persistentes). Elementos del Dashboard, como medidores de racha y predicciones de arquetipo, se encuentran "suscritos" puramente a eventos externos.
- **Axios**: Cliente HTTP para resolución de Promesas (`Promises`) enfocado a las lecturas seguras vía Inyección de Bearer Tokens (JWT).

## 3. Estado, Rendimiento y Seguridad
Para evitar jerarquía profunda de props (Prop Drilling), se manejan Contenedores de Estado Global (`Context API` o similar), garantizando que las credenciales de usuario persistan. Todas las rutas interactivas se hallan protegidas por componentes `Private Routes` que evalúan la validez criptográfica del JWT almacenado localmente o validan expiraciones con el Backend antes de montar los componentes sensibles.
