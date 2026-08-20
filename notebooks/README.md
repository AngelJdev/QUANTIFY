# Entorno de Ciencia de Datos y Algoritmia (Machine Learning)

El corazón analítico de QUANTIFY, este módulo (Liderado exclusivamente por la experimentación paramétrica de Francisco García), alberga los entornos de Jupyter (`.ipynb` y conversiones directas a script `.py`). Transita los datos transaccionales, identificando el significado de la constancia de manera automática.

## 1. Flujo Exploratorio (EDA - Análisis Exploratorio de Datos)
La base `01_exploratory_analysis.py` evalúa descriptivamente los picos anómalos. Crea matrices de correlación (Heatmaps) detectando variables ocultas. Aquí fue donde se descubrió paramétricamente si, estadísticamente hablando, dormir poco tiene co-linealidad absoluta con fracasar al registrar rutinas al día subsecuente.

## 2. Preparación y Balance de Matriz (`data_preparation`)
Esquema formal algoritmico donde la tabla de entrenamiento principal es fraccionada matemáticamente (Ej, 80% Train, 20% Test) para prevenir sobre-ajuste métrico (Overfitting). Aplica StandardScaler de `scikit-learn` permitiendo que algoritmos de distancia purista no generen proyecciones erradas, así como aplicación de SMOTE para contrapeso si se halla carencia de casos severos de _burnout_.

## 3. Topología de Modelos Matemáticos

### A) Clasificador del Riesgo Biológico Burnout (Patrón Supervisado)
Alojado en `/supervised/03_burnout_classifier.py`.
- **Estructura**: Modelo guiado que depende de etiquetas categóricas puras ya marcadas en el set de datos simulado (Bajo, Medio, Alto riesgo).
- **Proceso Científico**: Dependiendo de la varianza en las evaluaciones previas, se ejecutan modelos ensamblados (Por ej. Algoritmos de Bosque Aleatorio RandomForestClassifier) los cuales mapean horas perdidas vs cargas cognitivas superpuestas.

### B) Segmentación y Arquetipos Clínicos (Patrón No Supervisado)
Alojado en `/unsupervised/04_user_archetypes.py`.
- **Estructura**: Sin etiquetas históricas. El algoritmo encuentra similitudes inherentes puramente métricas a base de clústers.
- **Proceso Científico (K-Means Clustering)**: Determinando un parámetro $k$ fundamentado en el "Análisis Codo" (Elbow Curve) y Score de Silueta (Silhouette Score) para acoplar la densidad máxima natural (Ej. separando Arquetipos como "Deportista de Fin de semana", "Constancia Ansiosa", "Obrero Explotado").

## 4. Evolución y Distribución del Modelo
En `/evaluation/05_model_comparison.py`, se grafican curvas ROC, matrices de Confusión, Precisión, Recall y el F1-Score general. El modelo final triunfante se comprime algorítmicamente mediante `joblib`. 
Es ese peso final el cargado directamente a memoria a través de `child_process` en la RAM del backend (`/backend/API`) expuesto como Endpoint final sin obligar a usar APIs RESTful lentas por la red, permitiendo tiempos de inferencia sub-milimétricos (<10ms).
