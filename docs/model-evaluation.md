# Etapa 12 — Evaluación y Selección de Modelos

## Propósito

Este documento resume los resultados del pipeline de Machine Learning de QUANTIFY, evaluando el desempeño de los modelos supervisados y no supervisados, justificando la selección final y documentando los hallazgos clave.

---

## 1. Modelos Supervisados (Clasificación de Riesgo)

El objetivo fue predecir la variable `riesgo_abandono` (Bajo, Medio, Alto) utilizando 21 variables predictoras (15 numéricas, 6 categóricas codificadas).

### 1.1 Comparación de Modelos (Conjunto de Validación)

| Modelo | Accuracy | F1-Score (Weighted) | ROC-AUC |
| :--- | :---: | :---: | :---: |
| Regresión Logística | 91.07% | 0.9100 | 0.3748 |
| SVM (RBF Kernel) | 90.93% | 0.9087 | 0.3588 |
| Random Forest (Base) | 97.87% | 0.9785 | 0.3514 |
| **Random Forest (Optimizado)** | **98.13%** | **0.9812** | 0.3427 |

### 1.2 Análisis del Mejor Modelo: Random Forest Optimizado

Se aplicó `GridSearchCV` para encontrar los hiperparámetros óptimos:
- `max_depth`: 20
- `min_samples_split`: 2
- `n_estimators`: 200

#### Generalización y Sobreajuste
- **Accuracy Entrenamiento:** 100%
- **Accuracy Validación:** 98.13%
- **Accuracy Test:** 98.53%
- **Conclusión:** A pesar del 100% en entrenamiento, la brecha con validación y test es menor al 2%. La generalización es excelente y no hay sobreajuste patológico. El modelo de Random Forest captura perfectamente las relaciones no lineales.

#### Desempeño por Clase (Conjunto de Test)
| Riesgo | Precision | Recall | F1-Score |
| :--- | :---: | :---: | :---: |
| Bajo | 0.98 | 0.99 | 0.99 |
| Medio | 0.98 | 0.96 | 0.97 |
| Alto | 0.99 | 0.99 | 0.99 |

*Nota:* El modelo es extremadamente preciso para identificar usuarios en riesgo Alto.

#### Tiempos de Inferencia
- **Tiempo promedio:** ~0.58 milisegundos por registro.
- **Veredicto:** Apto para evaluación en tiempo real (Sockets/API de backend).

---

## 2. Modelos No Supervisados (Arquetipos de Usuarios)

Se aplicó K-Means Clustering y PCA para segmentar a los usuarios y descubrir patrones ocultos.

### 2.1 Configuración Óptima
- **Número de Clusters (k):** 3 (Seleccionado mediante el Método del Codo, coincidiendo con la heurística de negocio).
- **Componentes PCA:** Se retuvieron 8 componentes principales para explicar el 92.5% de la varianza.

### 2.2 Arquetipos Descubiertos

| ID | Nombre | % de Usuarios | Perfil Dominante |
| :---: | :--- | :---: | :--- |
| **C0** | En Riesgo de Abandono | 27.0% | Adherencia muy baja, fricción muy alta, alta correlación con riesgo Alto (72.8%). |
| **C1** | Exploradores Intermitentes | 41.7% | Valores intermedios en todas las métricas, riesgo ambiguo o Medio (92.6%). |
| **C2** | Guerreros Consistentes | 31.2% | Alta adherencia, baja fricción, alto bienestar, riesgo Bajo (52.7%) o Medio (47.3%). |

---

## 3. Conclusión y Selección

Se ha construido un pipeline dual para QUANTIFY:

1. **Clasificador (Supervisado):** `Random Forest Optimizado`.
   - **Uso:** Determina si un usuario abandonará la plataforma.
   - **Por qué:** Mayor accuracy (98.5%), robusto frente a la multicolinealidad presente en las variables conductuales, y no requiere escalado estricto.

2. **Segmentador (No Supervisado):** `K-Means (k=3)`.
   - **Uso:** Asigna al usuario a un arquetipo comportamental.
   - **Por qué:** Permite personalizar el contenido gamificado, incluso antes de que el riesgo sea evidente.

### 3.1 Integración Futura (Producción)
En el backend (Node.js), se expondrá un endpoint `/api/ml/predict` que cargará los archivos `.pkl` exportados en `models/serialized/`. Recibirá la telemetría del usuario, pasará por el `scaler.pkl` y ejecutará los dos modelos en paralelo para retornar la acción recomendada (ej. lanzar notificación de Gemini o enviar recompensa).

---
*Pipeline de Machine Learning completo y verificado.*
