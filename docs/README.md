# Documentacion Oficial de QUANTIFY

Bienvenido a la documentacion oficial del proyecto QUANTIFY. 

## 1. Informacion Clave del Proyecto
QUANTIFY es una plataforma avanzada enfocada en el analisis de habitos, salud y productividad. El proyecto integra diversas fuentes de datos estructurados para procesar, normalizar y aplicar algoritmos de Machine Learning que detectan patrones de comportamiento, como el riesgo de *burnout* y la clasificacion de arquetipos de usuario. Se despliega mediante una arquitectura moderna orientada a servicios, ofreciendo dashboards en tiempo real, consumo via API y soporte para dispositivos diversos (Wearables, TV, Web).

## 2. Visibilidad y Estructura del Proyecto
Para facilitar la lectura y el mantenimiento, los documentos se han organizado por areas logicas:

- [Arquitectura (`/architecture`)](./architecture/): Diseño tecnico, modelado de datos y procesos ETL.
- [Datos (`/data`)](./data/): Manejo, origen de la informacion, metodologias (CRISP-DM) y politicas de privacidad.
- [Inteligencia Artificial (`/ai`)](./ai/): Integracion de modelos, uso y evaluacion de resultados.
- [Despliegue (`/deployment`)](./deployment/): Manuales de produccion.
- [Gestion y Planeacion (`/management`)](./management/): Planteamiento, contexto, roadmap y plan de asignacion.
- [Assets (`/assets`)](./assets/): Multimedia y bitacoras (prompting).

## 3. Integracion de Inteligencia Artificial (AI y Machine Learning)
El nucleo analitico de QUANTIFY se basa en modelos de Machine Learning entrenados y expuestos a traves de la API:

* **Modelos Supervisados**: Empleados para predecir escenarios con etiquetas claras, especificamente un clasificador para detectar probabilidad y riesgo de *Burnout* de un usuario basado en metricas historicas de estres, descanso y horas de trabajo. (Ver codigo en `notebooks/supervised/03_burnout_classifier.ipynb`).
* **Modelos No Supervisados**: Utilizados para descubrir estructuras subyacentes en el uso del sistema sin etiquetas previas, como la segmentacion de *arquetipos de usuario* a traves de algoritmos de clustering (Ej. K-Means), permitiendo personalizar la experiencia del usuario (Ver codigo en `notebooks/unsupervised/04_user_archetypes.ipynb`).

Estos modelos se empaquetan en `joblib` y son interceptados mediante subprocesos (`child_process`) dentro de los controladores de Node.js (`/api/ml/predict-burnout` y `/api/ml/predict-archetype`).

## 4. Uso de WebSockets (Sockets)
La plataforma requiere retroalimentacion inmediata al usuario, por ende, hace uso de la tecnologia de WebSockets (via `Socket.io`). Las notificaciones, predicciones generadas asincronamente y estatus de procesos analiticos envian eventos (como `ml_prediction_updated` o actualizaciones de activacion premium). Esto garantiza que componentes en el Frontend (Ej. `AnalyticsPage.jsx`) muten de estado en tiempo real sin requerir refrescos manuales (polling) por parte del usuario.

## 5. Capturas de Pantalla y Evidencias Visuales

### 5.1. Plataforma Web (Dashboard)
![Captura Web - Dashboard Principal](./assets/images/dash1.png)
![Analíticas Detalladas](./assets/images/dash2.png)

### 5.2. Smartwatch (Wearables)

La integracion de QUANTIFY con dispositivos Wear OS se realiza mediante un proceso de vinculacion segura con la plataforma web. A continuacion se documenta el flujo principal:

1. **Inicio y Configuracion**: Al abrir la aplicacion en el reloj por primera vez, el sistema detecta que no hay sesion e instruye al usuario a iniciar la configuracion.
![Inicio - Dispositivo no configurado](./assets/images/smartwatch_01_init.jpeg)

2. **Generacion de Codigo OTP**: El reloj emite un codigo unico y temporal de 6 caracteres (ej. `38E973`). Este codigo se ingresa en el campo correspondiente dentro del modulo "Smartwatch" del Dashboard Web para autorizar de forma remota.
![Generacion de Codigo](./assets/images/smartwatch_02_otp.jpeg)

3. **Sincronizacion de Habitos**: Validado el token, el Smartwatch obtiene la informacion del usuario y muestra instantaneamente sus metricas diarias (ej. Caminar 0/10 KM, Tomar Agua 0/2 Litros).
![Lista de Habitos](./assets/images/smartwatch_03_habits.jpeg)

4. **Ajustes y Personalizacion**: El panel de ajustes nativo del reloj permite validar la cuenta (`paco@quantify.ai`), modificar el intervalo de sincronizacion en segundo plano (ej. cada 15 min) y personalizar el tema grafico.
![Ajustes del Smartwatch](./assets/images/smartwatch_04_settings.jpeg)

5. **Temporizador Nativo**: Funcionalidad de cuenta regresiva incorporada para el seguimiento de tiempos de enfoque o intervalos de descanso directamente desde la muñeca.
![Temporizador](./assets/images/smartwatch_05_timer.jpeg)

6. **Confirmacion de Registro**: Retroalimentacion visual ("REGISTRADO") que valida al usuario el exito de la transaccion mientras se sincronizan los datos en segundo plano.
![Registro Completado](./assets/images/smartwatch_06_registered.jpeg)

### 5.3. Pantalla TV (Dashboard Ejecutivo)
![Captura TV - Vista Ejecutiva](./assets/images/tv.jpeg)
![Métricas y Progreso](./assets/images/tv1.jpeg)

### 5.4. Pruebas y Consumo API (Swagger/Postman)
A continuación, se documenta la prueba de integración y payload del análisis predictivo de Burnout:

**Petición POST:**
```json
POST /api/ml/predict-burnout HTTP/1.1
Host: api.quantify.ai
Content-Type: application/json

{
  "user_metrics": {
    "stress_level": 8,
    "sleep_hours": 4.5,
    "work_hours": 12.5,
    "tasks_completed": 15
  }
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "risk_probability": 0.88,
    "classification": "Riesgo Alto",
    "recommendations": [
      "Aplicar bloqueo estricto de notificaciones laborales",
      "Sugerir ejercicio de respiración guiado de 5 min"
    ]
  }
}
```

---

## 6. Documentacion de Cumplimiento de la Rubrica Integrador (20 Puntos)

A continuacion se documenta en detalle el estado de cumplimiento de los 20 requisitos exigidos por la guia de evaluacion de la asignatura, proveyendo explicaciones y evidencias tecnicas verificables para cada fase del proyecto.

### 1. Contexto y planteamiento del problema
Se definieron claramente las problematicas actuales respecto a las metodologias tradicionales para el seguimiento de habitos y bienestar. QUANTIFY responde resolviendo la vulnerabilidad de recoleccion de metricas irrealistas mediante un entorno inmutable.
- **Evidencia**: [`/management/contexto.md`](./management/contexto.md) y [`README.md principal`](../README.md)

### 2. Metodologia de analisis de datos
El desarrollo se apega al estandar industrial CRISP-DM, delineando las etapas investigativas, desde la comprension inicial del negocio hasta la inyeccion a produccion de los modelos de inteligencia artificial.
- **Evidencia**: [`/data/metodologia-datos.md`](./data/metodologia-datos.md)

### 3. Veinte propuestas de aplicacion
Se plantearon rigurosamente multiples propuestas y alternativas para aplicar soluciones algoritmicas a la telemetria humana y rutinas, justificando la eleccion del proyecto principal.
- **Evidencia**: [`/management/proposals.md`](./management/proposals.md)

### 4. Descripcion de fuentes, atributos y datos
Se documentaron los origenes de datos biometricos y comportamentales. Se modelo logicamente la base de datos dividiendo entidades criticas para la retencion e integridad de logs del usuario.
- **Evidencia**: [`/data/data-sources.md`](./data/data-sources.md) y [`/architecture/modelo-datos.md`](./architecture/modelo-datos.md)

### 5. Simulacion estrategica del dataset
Para someter el sistema a alta disponibilidad e ingenieria robusta, se desarrollo un script algoritmico en Python que simula e inyecta historiales masivos de telemetria humana.
- **Evidencia**: [`../simulation/generate_dataset.py`](../simulation/generate_dataset.py)

```python
# Fragmento demostrativo: generate_dataset.py
def generate_telemetry_logs(user_count=1000):
    logs = []
    for user_id in range(user_count):
        logs.append({
            "user_id": f"usr_{user_id}",
            "heart_rate_avg": random.randint(60, 100),
            "sleep_hours": round(random.uniform(4.0, 9.0), 1),
            "focus_time_mins": random.randint(30, 240),
            "timestamp": datetime.now().isoformat()
        })
    return pd.DataFrame(logs)
```

### 6. Modelo de Data Warehouse o Data Mart
El almacenamiento analitico se preparo bajo un modelo logico de Estrella (Star Schema), asegurando consultas eficientes sobre enormes cantidades de logs de racha.
- **Evidencia**: [`../database/warehouse/star_schema.sql`](../database/warehouse/star_schema.sql)

```sql
-- Fragmento demostrativo: star_schema.sql
CREATE TABLE Fact_DailyMetrics (
    metric_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Dim_Users(user_id),
    date_id INT REFERENCES Dim_Time(date_id),
    total_steps INT,
    calories_burned DECIMAL(5,2),
    stress_score INT
);
```

### 7. Proceso ETL
Se automatizaron las canalizaciones o pipelines de datos (Extract, Transform, Load) para acondicionar e inyectar el dataset simulado limpiamente en las estructuras del Data Warehouse.
- **Evidencia**: [`../database/etl/etl_pipeline.py`](../database/etl/etl_pipeline.py)

### 8. Analisis Exploratorio de Datos (EDA)
Previó al aislamiento algoritmico, se inspecciono la varianza metodologica y tendencias ocultas en el dataset dentro del motor analitico.
- **Evidencia**: [`../notebooks/eda/01_exploratory_analysis.ipynb`](../notebooks/eda/01_exploratory_analysis.ipynb)

### 9. Implementacion de modelos supervisados
El area de Machine Learning ejecuto entrenamiento guiado por etiquetas (Supervisado) desarrollando un algoritmo que diagnostica el indice de Burnout en funcion a horas productivas y descansos.
- **Evidencia**: [`../notebooks/supervised/03_burnout_classifier.ipynb`](../notebooks/supervised/03_burnout_classifier.ipynb)

```python
# Fragmento demostrativo: 03_burnout_classifier.ipynb
from sklearn.ensemble import RandomForestClassifier

X = df[['stress_level', 'work_hours', 'sleep_hours']]
y = df['burnout_risk'] # 0 = Estable, 1 = Riesgo Alto

model = RandomForestClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

print(f"Accuracy de Validación: {model.score(X_test, y_test):.2f}")
```

### 10. Implementacion de modelos no supervisados
Para generar un analisis cognitivo del usuario sin etiquetas rigidas, se emplearon algoritmos de de segmentacion (clustering multidimensional) descubriendo "Arquetipos de Usuarios" intrinsecos en el sistema.
- **Evidencia**: [`../notebooks/unsupervised/04_user_archetypes.ipynb`](../notebooks/unsupervised/04_user_archetypes.ipynb)

```python
# Fragmento demostrativo: 04_user_archetypes.ipynb
from sklearn.cluster import KMeans

# Agrupando usuarios en 3 arquetipos: 'Intenso', 'Equilibrado', 'Inconsistente'
kmeans = KMeans(n_clusters=3, random_state=42)
df['archetype_id'] = kmeans.fit_predict(df[['activity_freq', 'goal_completion']])
```

### 11. Evaluacion y optimizacion de modelos
Multiples algoritmos fueron comparados en rendimiento para determinar su acierto (Accuracy) pre-despliegue, resultando en la seleccion de los parametros optimos finales.
- **Evidencia**: [`../notebooks/evaluation/05_model_comparison.ipynb`](../notebooks/evaluation/05_model_comparison.ipynb)

### 12. Seleccion de dos mecanismos despliegue
Tras someter los prototipos de prueba cruzada y de iteracion final, los modelos ganadores fueron empaquetados, serializados y almacenados.
- **Evidencia**: Directorio [`../notebooks/`](../notebooks/) y serializacion Joblib.

### 13. Dos endpoints inteligentes
Se acoplo eficientemente la logica externa de Python abriendo microservicios mediante subprocesos nativos que interceptan la solicitud HTTPS de prediccion y dirigen la red.
- **Evidencia**: Controladores (`child_process`) ubicados en [`../backend/API/`](../backend/API/)

```javascript
// Fragmento demostrativo: predictController.js
const { spawn } = require('child_process');

exports.predictBurnout = (req, res) => {
    const pythonProc = spawn('python', ['scripts/predict.py', JSON.stringify(req.body)]);
    
    pythonProc.stdout.on('data', (data) => {
        const prediction = JSON.parse(data.toString());
        res.status(200).json({ status: "success", data: prediction });
    });
};
```

### 14. Dashboard con actualizacion en tiempo real
Para proveer fluidez e inmunidad a procesos bloqueantes por peticiones, se instanció WebSockets (Socket.IO). El frontend mutea estado magicamente cuando finalizan asincronamente las rutinas matematicas del backend.
- **Evidencia**: Evento Web/Socket `ml_prediction_updated` en Frontend React.

### 15. Consumo web o wearable
Se desarrollo software multi-plataforma logrando retroalimentacion ininterrumpida entre el Dashboard ejecutivo Web y un Smartwatch Android Wear OS.
- **Evidencia**: Modulo [`../smartwatch/`](../smartwatch/)

### 16. Pruebas dataset, ETL, API
*(FASE EN PROGRESO: Falta integracion documental del reporte de stress tests simulando trafico web de concurrencia max.)*

### 17. Arquitectura de software
Se proveen documentaciones UML y explicaciones fisicas evidenciando la topologia e intercomunicacion orientada a micro-arquitecturas MVC, hibridas y logica cliente/servidor.
- **Evidencia**: Diagramas en [`./architecture/`](./architecture/)

```mermaid
graph LR;
    Client[Web / Wearable] -->|HTTPS / Sockets| API[Node.js API Gateway]
    API -->|Consultas| DB[(PostgreSQL)]
    API -->|Subprocesos| ML[Python ML Engine]
    ML -.->|Joblib| Models[Modelos Entrenados]
```

### 18. Documentacion tecnica
Documentacion funcional orientada a Ops/DevOps mediante estandares Swagger para navegacion e inspeccion en memoria (OpenAPI), e interfaces de indexacion.
- **Evidencia**: Repositorio y `/api-docs` activado via Backend Express.

### 19. Evidencias de trabajo colaborativo
El proyecto se cimento en un entorno cooperativo registrado a traves de control de versiones. Se documentan las metricas del repositorio mostrando la grafica de Git (GitGraph), tablas de frecuencias de commits por desarrollador, porcentajes de carga de codigo y la funcion especifica que cumplio cada quien, evidenciando equidad en la contribucion.
- **Evidencia**: Graficas de Commits, Gitgraph y estadisticas de repositorio (Documentado transversalmente usando herramientas de analitica de Git).

![Git Graph - Evidencia 1](./assets/images/gr1.jpeg)
![Git Graph - Evidencia 2](./assets/images/gr2.jpeg)
![Git Graph - Evidencia 3](./assets/images/gr3.jpeg)

### 20. Presentacion y defensa
La defensa oficial del proyecto, argumentación técnica y justificación gráfica se han consolidado en el material de presentación integrado.
- **Evidencia**: Presentación oficial interactiva descargable: [`QUANTIFY Presentación Completa.pptx`](./QUANTIFY%20Presentaci%C3%B3n%20Completa.pptx)


