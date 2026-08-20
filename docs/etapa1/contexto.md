# Etapa 1. Contexto y Planteamiento del Problema

## Propósito
Definir el escenario de aplicación de **QUANTIFY** y establecer qué necesidad conductual y analítica será atendida mediante técnicas de **Machine Learning (ML)** e Inteligencia Artificial.

---

## 1.1 Formulación de Contexto Estratégico

* **Nombre del proyecto:** QUANTIFY SYSTEM (Plataforma Híbrida de Hábitos y Biometría).
* **Organización:** Proyecto Integrador Universitario (IX Cuatrimestre) implementado como Startup de analítica de bienestar personal.
* **Proceso principal:** Ingesta de telemetría de comportamiento humano (hábitos completados, consistencia, valores cuantitativos como peso/tiempo) y análisis predictivo en tiempo real.
* **Usuarios involucrados:**
  1. **Usuario Final (Cliente):** Estudiantes, profesionales, o atletas que registran métricas.
  2. **Analista de Datos / Admin:** Monitorea la calidad de los procesos ETL y estado de los modelos de inferencia.
  3. **Sistema Experto Autónomo:** El modelo ML integrado y el agente Gemini operando transparentemente en backend.
* **Problemática actual (Pain Points):**
  Las plataformas de hábitos tradicionales muestran el progreso de forma binaria y basada en suposiciones simplistas. Los usuarios experimentan fricción y abandonan rutas de progreso porque **el sistema carece de componentes predictivos que anticipen el riesgo de fatiga psicológica ("Burnout") o quiebre de la racha (Streak break)** a partir de fluctuaciones en el esfuerzo registrado.
* **Decisiones que se desean mejorar:**
  1. Personalizar la intensidad, el tipo de recordatorios y el tono emocional de "Gemini AI" basándose en el grupo (cluster) al que pertenece el usuario.
  2. Emitir preventivamente una *Alerta de Riesgo de Abandono* antes de que el usuario rompa su consistencia de 66 días.
* **Integración tecnológica:** El sistema analítico alimentará una aplicación web React (Dashboard interactivo) emparejada a wearables (Smartwatch App), orquestados a través de un servidor Express con conexiones continuas por **WebSockets (Socket.IO)**.

---

## 1.2 Planteamiento y Formulación Científica del Problema

En un ecosistema donde la retención de usuarios depende críticamente de la percepción de éxito y adaptabilidad de la dificultad, **¿Cómo podemos clasificar el nivel de riesgo de abandono fisiológico o conductual y segmentar a los usuarios de QUANTIFY basándonos en sus tendencias de consistencia, valores biométricos y la fricción percibida reportada en la plataforma?**

Se resolverá implementando:
- Modelos **Supervisados** para predicción de riesgo inminente.
- Modelos **No Supervisados** para agrupación y descubrimiento de patrones de fatiga y alta consistencia.

---

## 1.3 Objetivos del Componente ML

* **Objetivo General:** Entrenar, evaluar y desplegar un ecosistema predictivo híbrido en QUANTIFY que reduzca la tasa de abandono prematuro de hábitos mediante inferencias en tiempo real y personalización dinámica del esfuerzo.
* **Objetivos Específicos:**
  1. Definir un conjunto de datos (simulado artificialmente) equivalente a 6 meses de telemetría en QUANTIFY.
  2. Entrenar y serializar un modelo de *Clasificación Supervisada* que diagnostique estrés o riesgo de abandono (Bajo / Medio / Alto).
  3. Ejecutar un algoritmo de *Agrupamiento (Clustering)* para aislar perfiles o arquetipos de usuarios.
  4. Exponer las inferencias en endpoints de Node.js mediante APIs de baja latencia consumidos por el Dashboard.

## 1.4 Preguntas de Análisis Clave

Para guiar la selección de características (Feature Engineering) y algoritmos, formulamos:

1. ¿Qué variables (Edad, Fricción, Tasa de Adherencia, Tendencia de Crecimiento) influyen más significativamente en categorizar el riesgo de un usuario?
2. ¿Qué nivel de confiabilidad predictiva (*Accuracy*, *F1-Score*) es necesario para no frustrar al usuario con falsos positivos en las alertas del Wearable?
3. ¿Cuántos grupos naturales (*k*) existen en nuestra base de datos de usuarios si tomamos en cuenta su frecuencia de conexión?
4. ¿Cómo fluctúa el riesgo de deserción en los primeros 21 días frente al período crítico de 22-66 días?
5. ¿Qué sobrecarga en la latencia de respuesta implicará inyectar los modelos `.pkl` / `.onnx` serializados al flujo en tiempo real (Socket.IO) del sistema existente?
