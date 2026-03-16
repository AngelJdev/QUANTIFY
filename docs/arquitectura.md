# 🏗️ Arquitectura del Sistema: Quantify

Este documento describe la estructura técnica, las decisiones de diseño y el flujo de datos de Quantify. El sistema está diseñado bajo una arquitectura de **Cliente-Servidor** para asegurar la escalabilidad y permitir el procesamiento de métricas analíticas sin sobrecargar el dispositivo del usuario.

## 1. Patrón Arquitectónico
Se utilizará un modelo de capas separadas (Decoupled Architecture) para independizar la interfaz de usuario de la lógica de negocio y los cálculos matemáticos.

* **Capa de Presentación (Frontend):** Responsable de la UI/UX, captura de datos y renderizado de gráficos de progresión.
* **Capa de Lógica de Negocio (Backend/API):** Procesa los registros, aplica las fórmulas de ciencia del comportamiento (ej. Tasa de Adherencia, Índice de Progresión) y gestiona la autenticación.
* **Capa de Persistencia (Base de Datos):** Almacenamiento relacional para mantener la integridad de las métricas de los hábitos y los usuarios.

## 2. Stack Tecnológico (Propuesta)

### Frontend (Cliente Móvil / Web)
* **Tecnología:** React Native (para exportar a iOS/Android) o React.js / Next.js (si el enfoque inicial es web).
* **Gestión del estado:** Zustand o Redux (necesario para manejar los datos de los gráficos sin recargar la app).
* **Gráficos:** Recharts o Victory (para renderizar las curvas de sobrecarga progresiva y adherencia).

### Backend (API REST)
* **Tecnología:** Node.js con Express o Python con FastAPI. *(Nota: FastAPI es excelente si en el futuro se integran modelos de machine learning o cálculos estadísticos pesados).*
* **Autenticación:** JWT (JSON Web Tokens) para mantener sesiones seguras sin estado.

### Base de Datos
* **Tecnología:** PostgreSQL. Es ideal por su rigidez relacional y capacidad para hacer consultas complejas (como agrupar el peso levantado por semanas para calcular tendencias).

## 3. Flujo de Datos (Data Flow)
**Ejemplo de flujo: Registro de un hábito cuantitativo.**

1. **Captura (Frontend):** El usuario ingresa un nuevo registro. Ej: *Hábito de Lectura, 15 páginas leídas hoy, 30 minutos de duración*.
2. **Transmisión (Red):** El cliente envía un POST a `/api/logs` con el `habito_id`, la `fecha`, el `valor_registrado` (15) y las `notas` ("Lectura fluida").
3. **Procesamiento (Backend):**
   * La API valida el token del usuario.
   * Guarda el registro en la base de datos PostgreSQL.
   * Ejecuta un *Worker* para actualizar la racha actual y verificar si se alcanzó la meta diaria.
4. **Respuesta:** El servidor devuelve un código `201 Created` y el nuevo porcentaje de adherencia mensual.
5. **Actualización (Frontend):** La interfaz muestra el nuevo dato en la gráfica, confirmando visualmente el progreso.

## 4. Despliegue y CI/CD
* **Control de Versiones:** Git / GitHub (Siguiendo el modelo Git Flow con ramas `main`, `develop` y `features`).
* **Hosting propuesto:** * Backend: Render o Railway.
    * Base de datos: Supabase o Neon (PostgreSQL en la nube).
    * Frontend (Web): Vercel.