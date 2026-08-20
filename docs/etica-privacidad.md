# Ética, Privacidad y Sesgos en QUANTIFY

## 1. Introducción
El proyecto QUANTIFY procesa información relacionada con el estado emocional, hábitos de trabajo y perfil de los usuarios. Al emplear modelos de Machine Learning (Random Forest para Burnout y K-Means para Arquetipos), es imperativo establecer límites éticos claros para proteger la integridad y privacidad de los individuos involucrados.

## 2. Privacidad y Datos Sensibles
### ¿Qué datos se utilizan y por qué?
- **Variables Psicológicas y de Salud:** Nivel de estrés, horas de sueño, horas trabajadas. Estas variables son indispensables para predecir correctamente el riesgo de burnout.
- **Variables de Desempeño:** Frecuencia de entregas, horas extra, interacciones.

### Anonimización y Minimización
- **Ausencia de PII (Personally Identifiable Information):** El conjunto de datos de entrenamiento y las consultas a la API no requieren ni procesan nombres, correos electrónicos, ni documentos de identidad.
- Los perfiles se identifican mediante IDs anónimos autogenerados.
- El modelo se limita estrictamente a las 21 variables numéricas seleccionadas, omitiendo recolectar datos irrelevantes como género, raza, religión o afiliación política.

## 3. Análisis de Sesgos
### Sesgos Potenciales en Random Forest (Burnout)
- **Sesgo de Muestra:** Si el dataset sintético o los datos iniciales provienen mayormente de roles de oficina (tech, management), el modelo podría infravalorar el burnout en trabajos manuales o de atención al cliente.
- **Sesgo por Cultura Laboral:** El umbral de "horas extra" o "alta presión" varía según la cultura. El modelo podría penalizar perfiles que trabajan en culturas donde jornadas largas no están correlacionadas directamente con estrés.

### Grupos Afectados
- Empleados con métricas de productividad tradicionalmente bajas pero de alta calidad estratégica podrían ser erróneamente clasificados como "En riesgo" o asignados a un clúster no representativo.

## 4. Límites del Modelo e Intervención Humana
### ¿Qué decisiones NO deben automatizarse?
- **Despidos o Evaluaciones de Desempeño:** El resultado de la clasificación de Burnout o Arquetipo **no debe utilizarse** bajo ninguna circunstancia para penalizar, degradar o despedir a un empleado.
- **Diagnósticos Médicos:** QUANTIFY **no es una herramienta de diagnóstico clínico**. Provee indicadores de riesgo organizacionales, pero no sustituye la valoración de un profesional de la salud mental.

### Intervención de un Profesional
- Cuando el sistema clasifica a un usuario en "Alto Riesgo de Burnout", la acción recomendada es detonar un mensaje preventivo u ofrecer apoyo de Recursos Humanos / Salud Ocupacional, manteniendo la confidencialidad.

## 5. Medidas Preventivas y Advertencias en la Interfaz
- Se añadirá (o se asume) un descargo de responsabilidad (disclaimer) en el frontend y en el wearable indicando que: *"Los resultados generados por QUANTIFY son de carácter orientativo y no constituyen un diagnóstico médico."*
- Los datos de inferencias almacenados están protegidos y solo deben ser accesibles bajo protocolos de autenticación en la plataforma administrativa.
