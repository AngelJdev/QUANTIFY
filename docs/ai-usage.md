# Uso Responsable de IA Generativa en QUANTIFY

> Registro documentado de uso de IA generativa durante el desarrollo del sistema **QUANTIFY**, cumpliendo con los estándares de uso responsable, validación humana y responsabilidad del equipo.

## 1. Herramientas Utilizadas
- **ChatGPT (GPT-4 / GPT-3.5):** Utilizado para generación de bases de código (formularios, validaciones, JWT) y revisión de sintaxis.
- **GitHub Copilot:** Autocompletado de código en el entorno de desarrollo local (VS Code).

## 2. Registro de Intervenciones Clave

### A. Validaciones Backend con express-validator
- **Prompt Importante:** *"Validaciones Backend: Un middleware usando express-validator para una ruta de ejemplo (ej. creación de un registro). Debe validar que los campos requeridos no estén vacíos, que los correos tengan formato válido y sanitizar las entradas para evitar inyecciones."*
- **Código Generado:** Funciones de middleware con `check()` y `validationResult()`.
- **Errores Encontrados:** El código inicial no manejaba correctamente las respuestas de error estructuradas que el frontend esperaba.
- **Cambios Realizados:** Se adaptó el formateo de errores para coincidir con la convención `{ success: false, message: ... }` del proyecto.
- **Validaciones:** Se probó manualmente enviando payloads malformados vía Postman, comprobando que las inyecciones y datos vacíos fueran rechazados.
- **Decisiones del Equipo:** Se decidió abstraer las validaciones en archivos separados dentro de `middleware/` para no saturar los controladores.

### B. Sistema de Autenticación con JWT y Bcrypt
- **Prompt Importante:** *"Actúa como un desarrollador backend senior experto en Node.js. Necesito implementar un sistema de autenticación seguro para mi aplicación web. Genera un flujo completo de registro e inicio de sesión utilizando JWT y Bcrypt.js..."*
- **Código Generado:** Controladores de login/register y middleware de autenticación (`verifyToken`).
- **Limitaciones de la IA:** La IA incluyó configuraciones por defecto de expiración muy largas (ej. 30 días) y omitió validaciones de variables de entorno nulas.
- **Cambios Realizados:** Se ajustó el tiempo de expiración a estándares más seguros (ej. 24h) y se implementó lógica estricta para leer `process.env.JWT_SECRET`.

### C. Dashboard y Formularios Frontend (React, Recharts, Formik)
- **Prompt Importante:** *"Actúa como un desarrollador Frontend Senior experto en React, Tailwind CSS y Recharts. Necesito crear un dashboard moderno para una aplicación de seguimiento de hábitos personales..."*
- **Código Generado:** Componentes visuales de Recharts y validaciones con Yup.
- **Cambios Realizados:** Ajuste manual de la paleta de colores para coincidir con la identidad corporativa de QUANTIFY. Adaptación de los esquemas de validación (Yup) para que coincidieran con la estructura de base de datos de MongoDB.

## 3. Consideraciones Éticas y Reglas del Equipo
- **Supervisión humana:** Absolutamente todo el código generado fue revisado y probado localmente antes de hacer merge a ramas principales. Ningún fragmento de código fue integrado sin que al menos un miembro del equipo pudiera explicar su funcionamiento línea por línea.
- **Adaptación contextual:** Nunca se usó el código "tal cual" (copy-paste ciego); siempre se refactorizó para encajar en la arquitectura del proyecto (MVC, inyección de dependencias, etc.).
- **Responsabilidad de Modelos ML:** **Prohibición estricta** de utilizar ChatGPT para elegir qué modelo supervisado o no supervisado implementar sin realizar una evaluación de métricas manual primero. La IA solo se usó para asistir en la escritura sintáctica del código Python (`scikit-learn`), no en la toma de decisiones estadísticas.

---
*Documento creado para satisfacer la Etapa 19 de la rúbrica del Proyecto Integrador.*
