# Etapa 2. Metodología para el Análisis de Datos

## Propósito
Definir y organizar el proceso analítico y de Machine Learning de **QUANTIFY** utilizando un estándar riguroso de la industria, asegurando que los hallazgos de los datos se traduzcan en características operativas para el entorno de producción (Backend y Dashboard).

---

## 2.1 Metodología Seleccionada

**CRISP-DM (Cross-Industry Standard Process for Data Mining)** ha sido la metodología seleccionada para articular el componente de Machine Learning y Analítica en este proyecto.

### Justificación de Uso
Aunque la plataforma general (React/Node) se rige bajo enfoques ágiles y gestión PMBOK tradicional, el diseño de inferencia e IA requiere iteraciones basadas fuertemente en datos. Se seleccionó CRISP-DM porque:
1. **Es agnóstica a herramientas:** Se adapta al uso de Python (`scikit-learn`, `pandas`) para investigación, interactuando con los endpoints finales en Express.js.
2. **Ciclo de retroalimentación ágil:** Permite transitar naturalmente desde la fase 6 (Despliegue de los modelos `.pkl`/`.onnx` o el prompt tuning de Gemini) de regreso a la fase 1 (Comprensión de retención del usuario).
3. **Robustez probada:** Ha mantenido su relevancia como el ciclo de vida más implementado para proyectos que escalan hacia producción.

---

## 2.2 Relación de Fases y Responsabilidades Técnicas

Cada fase de la metodología CRISP-DM se alinea directamente con las etapas estipuladas por la rúbrica y las asignaciones del equipo.

| Fase CRISP-DM | Responsable(s) en QUANTIFY | Actividad Técnica | Impacto |
| :--- | :--- | :--- | :--- |
| **1. Comprensión del Negocio** | Brian (DEV 5) <br> Angel (DEV 1) | Definición de 20 propuestas, contexto operativo de hábitos, y justificación biológica y ética del problema. | Sentar requerimientos de predicción (Abandono/Fricción). |
| **2. Comprensión de Datos** | Francisco G. (DEV 2) | Simulación controlada y reproducible (`np.random.seed(2026)`) que repliegue el comportamiento biológico de los usuarios y modelado DDL. | Disponer del insumo base crudo. |
| **3. Preparación de Datos** | Francisco G. (DEV 2) | Script ETL local: Limpieza, balanceo, codificación One-Hot, normalización numérica y particionado en `training`/`test`. | Evitar fugas de datos y sobreajuste del modelo. |
| **4. Modelado** | Jesús A. Artiaga (DEV 3) | EDA en cuadernos Jupyter EDA, ajuste de hiperparámetros y entrenamiento de Clasificadores (RF/LogReg) y Clusters K-Means. | Obtención matemática de la relación de datos. |
| **5. Evaluación** | Brian (DEV 5) <br> Jesús A. Artiaga (DEV 3) | Medición de Accuracy, F1-Score y Silhouette Score. Análisis de ética algorítmica y prevención de sesgos raciales/género en biométricas. | Selección certificada del modelo final a serializar. |
| **6. Despliegue** | Angel (DEV 1) <br> Al Farías (DEV 4) | Inyección del modelo al Backend Express, diseño Swagger de la API (DEV 1) y conexión mediante WebSockets (DEV 4). | Impacto real en alertas del Smartwatch y el Dashboard. |

---

## 2.3 Criterios de Aceptación y Gobernanza (Quality Gates)

Para asegurar la fluidez de un equipo de 5 personas operando sobre este ciclo iterativo, se impone que:
- **Entre las Fases 3 y 4:** El dataset debe estar debidamente catalogado (`validation`, `training`, `test`) e inmutable (commit a master en carpeta `data/`) antes de abrir Jupyter.
- **Entre las Fases 5 y 6:** Los modelos serializados (`.pkl` o `.onnx`) deben mostrar una exactitud mayor al 75% en pruebas para clasificar al despliegue, para garantizar utilidad práctica en la plataforma.

## 2.4 Cronograma Cíclico
La ejecución de esta metodología corresponde a los sprints de Data Analytics declarados:
* **Sprint 1 (Fases 1, 2, 3):** Simulación sintética, base ETL y comprensión.
* **Sprint 2 (Fases 4, 5):** EDA, Modelado Algorítmico y Validación Ética.
* **Sprint 3 (Fase 6):** Conexión Express, Socket.IO final y QA de API.
