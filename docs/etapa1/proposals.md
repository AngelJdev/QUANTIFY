# Etapa 3. Veinte Propuestas de Aplicación (Machine Learning)

## Propósito
Analizar distintas posibilidades de extracción de valor a partir de los datos conductuales, biométricos y de interacción registrados por los usuarios en la plataforma **QUANTIFY**, validando la viabilidad de la integración en la aplicación productiva.

---

## 10 Propuestas de Modelos Supervisados

| Nombre del Mecanismo | Problema que Atiende | Usuario Beneficiado | Datos y Entradas (Inputs) | Salida (Predicción) | Algoritmo Sugerido | Integración API Express |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Predicción de Riesgo de Abandono (Burnout)** | Anticipa si un usuario a punto de formar un hábito va a desertar en los próximos 7 días | Usuario Final | `Consistencia`, `Friccion_Percibida`, `Frecuencia_Fallo` | Clasificación: Alto / Medio / Bajo | Random Forest / Regresión Logística | `/api/ml/predict-burnout` (Generar alerta en Wearable) |
| **2. Clasificación de Estrés Fisiológico** | Detecta saturación corporal antes de reportar enfermedad | Usuario Final | `FC_Media`, `SpO2_Promedio`, `Horas_Sueño` | Nivel de estrés (1 - 5) | Support Vector Machine (SVM) | `/api/ml/stress-level` (Widget React) |
| **3. Pronóstico de Mejora en Hábitos Cuantitativos** | Estima cuánto mejorará el usuario en $N$ semanas (Ej. kms corridos) | Atleta / Estudiante | `Valor_Registrado` (Histórico temp.), `Edad` | Continuo: Valor Kms / Tiempo estimado | Regresión Lineal o ARIMA | Gráfica temporal en el Dashboard |
| **4. Detección de Registros Falsos** | Evita que usuarios hagan clics erráticos solo por mantener rachas | Admind / Sistema QA | Velocidad de clics, Distancia temporal de registros | Clasificación Binaria: Fraude/Legítimo | Árbol de Decisión | Filtro de entrada en `logsController.js` |
| **5. Estimación de Energía Disponible** | Ayuda a dosificar la dificultad sugerida de hábitos durante el día | Usuario Final | `Pasos_Diarios`, `Horas_Sueño` | Porcentaje (0% - 100%) Energético | Gradient Boosting | Integración a Gemini prompt variable |
| **6. Predicción de Tiempo Restante Inactivo** | Prevé cuánto tiempo pasará hasta el próximo inicio de sesión | Admin Marketing | `Ultima_Conexion`, `Frecuencia_Uso_Mensual` | Continuo: Horas esperadas | Random Forest Regressor | Disparador automático de correos (Mailchimp/SendGrid) |
| **7. Clasificación de Prioridad de Soporte** | Categoriza tickets de usuarios basados en su impacto financiero o riesgo | Admin Soporte | `Mensaje_Ticket`, `Rol_Usuario` | Etiqueta (Urgente / Normal) | Naive Bayes (NLP Clásico) | Sistema interno del tablero Admin |
| **8. Predicción de Aceptación Premium** | Identifica usuarios gratuitos propensos a pagar la subscripción de QUANTIFY Pro | Director Finanzas | `Edad`, `Rachas_Maximas`, `Uso_Smartwatch` | Probabilidad (0.00 - 1.00) | Regresión Logística | Mostrar banner Premium React en momento adecuado |
| **9. Pronóstico de Saturación del Sistema** | Estimar la carga de conexiones Socket.IO basada en la hora del día | DevOps / Tech Lead | `Hora`, `Dia_Semana`, `Temporada_Escolar` | Continuous: # Conexiones Concur. | Regresión Polinomial | Config. Auto-scaling AWS/DigitalOcean |
| **10. Clasificación de Logros Siguientes** | Predecir qué trofeo desbloqueará un usuario a continuación | Usuario Final | `Lista_Logros_Obtenidos`, `Dias_Activo` | Etiqueta de Trofeo Esperado | KNN (K-Nearest Neighbors) | Elemento de Gamificación UI |

---

## 10 Propuestas de Modelos No Supervisados

| Nombre del Mecanismo | Problema que Atiende | Usuario Beneficiado | Datos y Entradas (Inputs) | Salida (Clúster o Representación) | Algoritmo Sugerido | Integración API Express |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Segmentación por Consistencia (Arquetipos)** | Identifica grupos naturales de usuarios según sus rutinas reales (No supuestas) | Creador Producto | `Consistencia`, `Friccion`, `Dias_Promedio_Conexion` | ID Cluster (Ej. "Guerreros", "Eventuales") | **K-Means Clustering** | Endpoint genérico `/api/ml/cluster-user` |
| **2. Detección de Anomalías Infecciosas** | Encuentra días con comportamientos biométricos extraños en el usuario | Usuario (Alud) | `FC_Reposo`, `Frecuencia_Respiratoria` | Binario Anómalo vs Normal | Isolation Forest | Pop-up médico preventivo |
| **3. Agrupamiento de Hábitos Afines** | Agrupa rutinas que la gente suele construir al mismo tiempo | Científico de Datos | Vector de hábitos creados por el usuario | Clusters Hábito 1 - Hábito $K$ | DBSCAN | Recomendador: "Gente que registró correr, también registra Meditar" |
| **4. Reducción Dimensional Visual de Perfiles** | Permite proyectar usuarios complejos en 2D para tableros gerenciales | Admin Data | `[Edad, Friccion, Rachas, Pasos...]` (8 dimensiones) | Componente Principal X y Y (2D) | PCA (Principal Component Analysis) | Gráfico Scatterplot en React Admin Dashboard |
| **5. Descubrimiento de Patrones de Sesión** | Agrupa secuencias de clic en la web para entender cómo se navega | Diseñador UX | Secuencia de visitas a URLs dentro del Dashboard | Topologías de Navegación | Modelos de Markov | Reporte trimestral (Sin despliegue real-time) |
| **6. Agrupamiento Temporal de Actividad** | Identifica las "Horas Pico" reales de la app no basadas en la media (Sino agrupaciones) | Ing. Backend | Hora exacta y Duración de la conexión | Intervalos temporales ($T_1$, $T_2$) | Algoritmo EM (Gaussian Mixture) | Optimizar cronjobs de DB |
| **7. Detección de Dispositivos Anómalos** | Aisla IPs o firmas de hardware (Smartwatches piratas) no esperados | Seguridad IT | `OS`, `Latencia`, `Tamaño_Paquete_Socket` | Puntuación de anomalía | Local Outlier Factor (LOF) | Log en consola del servidor (PM2) |
| **8. Agrupamiento de Feedback Sentimental** | Clasifica comentarios libres en "temas" sin entrenar categorías | Product Manager | Textos libres de fricción de los logs diarios | Temas Latentes Naturales (Listas de palabras) | Latent Dirichlet Allocation (Topic Modeling) | Etiqueta al pie de los comentarios en Admin Panel |
| **9. Segmentación Nutricional Relacional** | Asocia hábitos de ingesta calórica o agua con los tiempos de entrenamiento | Coach (Plataforma) | Kcal, Litros y Minutos registrados | Clusters Dietéticos | Clustering Jerárquico | Sugerencias estáticas en Prompt Gemini |
| **10. Asociación de Dispositivos (Reglas)** | Encuentra reglas tipo si-entonces, ej. "Si compra el plan anual -> Usa Smartwatch" | Marketing | Tabla transaccional `Usuarios_Licencia_Hardware` | Probabilidades Lógicas de asociación | Algoritmo Apriori | Envío de correos para upsell de hardware |

---

*(Nota: De estas 20 opciones, se tomará como modelo seleccionado final (Etapas 10 y 11) la Predicción Supervisada de Abandono y la Segmentación No Supervisada de Arquetipos mediante K-Means).*
