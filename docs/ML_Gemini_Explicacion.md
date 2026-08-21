# Machine Learning e Inteligencia Artificial (Gemini) en Quantify

El corazón tecnológico de **Quantify** reside en su capacidad para ir más allá del registro estático. Mientras las aplicaciones de hábitos convencionales dependen de la honestidad del usuario y ofrecen esquemas fijos de gamificación, Quantify emplea arquitecturas de Inteligencia Artificial para auditar, prever y personalizar la experiencia del usuario basándose en métricas biométricas inmutables extraídas mediante telemetría WearOS.

Esta innovación se logra a través de la conjunción dual de dos paradigmas de la IA: **Machine Learning Clasificatorio Clásico (Modelos Predictivos)** e **Inteligencia Artificial Generativa (LLMs de Google Gemini)**.

---

## 1. Machine Learning: Intercepción Predictiva y Modelado de Datos

El componente de Machine Learning en Quantify opera de manera encriptada en el backend interactuando con scripts nativos en Python. A diferencia de las IA modernas que "generan" texto, el Machine Learning tradicional aquí actúa de manera analítica, empleando matemáticas y probabilidades para encontrar patrones ocultos en grandes volúmenes de datos.

### A. Algoritmo K-Means (Clasificación No Supervisada)
Quantify ingiere docenas de variables por usuario (horas de sueño, constancia, pasos diarios, niveles de estrés, frecuencia cardíaca máxima). Ya que ningún usuario encaja perfectamente en una caja, usamos el algoritmo K-Means para descubrir **Arquetipos de Productividad**.
K-Means evalúa las distancias vectoriales entre la actividad pasada del usuario y la agrupa en una categoría biométrica (Ej. "Sobre-esforzado con riesgo", "Constante pero estancado", "Productivo Balanceado"). Esto rompe con la típica categorización superficial de otras apps.

### B. Random Forest / Árboles de Decisión (Aprendizaje Supervisado)
Una vez que el clúster es determinado, el motor enruta la data histórica pre-etiquetada a un modelo predictivo, como un Random Forest. Su objetivo es ejecutar una predicción binaria o porcentual de un colapso.
Analizando cuándo los usuarios fallan sus rachas y el cruce con sus niveles de SpO2 (oxígeno) y fricción promedio, el sistema calcula probabilísticamente si el usuario está en riesgo inminente de claudicar, bautizado formalmente como **"Riesgo de Burnout" o "Riesgo de Abandono"**.

---

## 2. Inteligencia Artificial Generativa: El API de Google Gemini

Si el Machine Learning clásico nos da los números fríos, probabilidades y alertas rojas corporales, Google Gemini nos proporciona la **cognición, interpretación y adaptabilidad**. Quantify cuenta con integración nativa directa con la API Gemini de Google, apalancando el poder de los Grandes Modelos de Lenguaje (LLMs).

### A. Generador Dinámico de Hábitos Inteligentes
En la etapa inicial del usuario (Onboarding), una meta ambiciosa puede resultar abrumadora (ej. "¿Cómo inicio a correr un maratón?"). Aquí es donde interviene Gemini.
En lugar de forzar al usuario a inventar sus propios hábitos, Quantify dispara un prompt seguro y con alta "temperatura" algorítmica hacia Gemini estructurado con los datos antropométricos del usuario (peso, edad, nivel de actividad). Gemini devuelve un esquema estructurado (JSON) que automáticamente inyecta tácticas fraccionadas (micro-hábitos) listos para iniciar en el sistema de manera realista, mitigando así el golpe psicológico inicial.

### B. Mentoría Activa y Semántica Contextual
El modelo predictivo arroja alertas booleanas ("true/false: usuario quemado"). Estas alertas se procesan para disparar rutinas de Gemini que le hablan al usuario con base en sus métricas actuales. La API de Gemini sintetiza los datos en mensajes entendibles, ofreciendo palabras de aliento fundamentadas empíricamente en su esfuerzo real.

---

## 3. Simbiosis Arquitectónica: ¿Cómo interactúan en Quantify?

El emparejamiento de estas tecnologías otorga una robustez impenetrable contra la ingeniería inversa y el engaño del cerebro humano:

1. **Recolección:** El Smartwatch recolecta el desgaste real (frecuencia cardíaca, sueño).
2. **Auditoría (Python/ML):** El modelo predictivo Python inspecciona la biometría y dictamina que un usuario afirma haber dormido bien, pero el clúster denota fatiga crónica.
3. **Reducción de Metas (Lógica):** Automáticamente, el sistema degrada la exigencia de las tareas.
4. **Adaptación y Asistencia (Gemini):** El motor no solo reduce el esfuerzo del día, sino que Gemini elabora de inmediato planes de recuperación activa explicados desde la empatía.

En resumen, Machine Learning estructura la "verdad" de lo que padece el cuerpo, mientras que Gemini lidera la re-adaptación neuronal de metas. Juntos formulan el tracker de hábitos definitivo diseñado para seres humanos reales, no para androides.
