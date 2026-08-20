# Etapa 16 — Plan de Pruebas

## QUANTIFY SYSTEM — Verificación Integral de Componentes

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Equipo:** QUANTIFY  

---

## 1. Objetivo

Comprobar que los datos, modelos de Machine Learning, endpoints de la API e integración entre todos los componentes del sistema QUANTIFY funcionan correctamente, validando tanto casos exitosos como escenarios de error, fronteras y condiciones extremas.

---

## 2. Alcance

El plan de pruebas cubre los siguientes componentes del sistema:

| Componente | Tipo de Prueba | Herramienta |
| :--- | :--- | :--- |
| Dataset (`data/raw/quantify_telemetry.csv`) | Validación de datos | pytest + pandas |
| Simulación (`simulation/generate_dataset.py`) | Reglas y reproducibilidad | pytest + numpy |
| Pipeline ETL (`database/etl/etl_pipeline.py`) | Extracción, transformación, carga | pytest + pandas |
| Modelos ML (`models/serialized/`) | Métricas, estabilidad, frontera | pytest + scikit-learn + joblib |
| API REST (`backend/`) | Endpoints, validación, latencia | Jest + Supertest |
| Integración (Frontend + Backend + Wearable) | Socket.IO, persistencia, reconexión | Jest + socket.io-client |

---

## 3. Estrategia de Pruebas

### 3.1 Pruebas de Dataset (16.1)

Validar la calidad e integridad del dataset crudo generado por la simulación.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| DS-001 | Verificar rangos numéricos de todas las columnas | Todos los valores dentro de los límites definidos en `simulation_rules.md` |
| DS-002 | Verificar valores nulos controlados (~2.5% en biométricos) | Porcentaje de nulos entre 1% y 5% por columna biométrica |
| DS-003 | Verificar ausencia de duplicados en `usuario_id` | 0 duplicados |
| DS-004 | Verificar integridad referencial (IDs únicos, formato USR-XXXXX) | 100% de IDs válidos |
| DS-005 | Verificar distribución de `riesgo_abandono` | Las 3 clases presentes con distribución no degenerada |
| DS-006 | Verificar balance de clases (ninguna < 10%) | Ninguna clase por debajo del 10% |
| DS-007 | Verificar tipos de datos de cada columna | Tipos correctos según esquema |

### 3.2 Pruebas de Simulación (16.2)

Validar que el generador de datos cumple con las reglas documentadas.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| SIM-001 | Verificar que las reglas de clasificación de riesgo son correctas | Labels coinciden con condiciones lógicas |
| SIM-002 | Verificar casos normales (adherencia media, estrés bajo) | Clasificados como "Bajo" riesgo |
| SIM-003 | Verificar casos extremos (fantasma, burnout, outliers) | Correctamente generados y clasificados |
| SIM-004 | Verificar coherencia entre variables correlacionadas | Correlaciones dentro de rangos esperados (±0.15) |
| SIM-005 | Verificar reproducibilidad con semilla fija (2026) | Dos ejecuciones generan el mismo DataFrame |

### 3.3 Pruebas de ETL (16.3)

Validar la integridad del pipeline de preparación de datos.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| ETL-001 | Extracción lee correctamente el CSV | DataFrame no vacío, columnas correctas |
| ETL-002 | Transformación imputa nulos con mediana | 0 nulos en columnas críticas post-transformación |
| ETL-003 | Transformación genera codificaciones One-Hot | Columnas `genero_*` y `disp_*` presentes |
| ETL-004 | Carga preserva el conteo total de registros | Registros salida = Registros entrada - duplicados |
| ETL-005 | Pipeline es repetible (idempotencia) | Dos ejecuciones producen el mismo resultado |
| ETL-006 | Manejo de errores ante archivo inexistente | Excepción controlada, no crash silencioso |

### 3.4 Pruebas de Modelos (16.4)

Validar el desempeño y robustez de los modelos serializados.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| ML-001 | Accuracy del modelo supervisado (RF) > 95% en validación | Según `supervised_metrics.csv` |
| ML-002 | Generalización: diferencia train/val < 5% | Sin sobreajuste severo |
| ML-003 | Estabilidad: misma predicción para misma entrada repetida | 100% consistente |
| ML-004 | Sobreajuste: accuracy train vs val no diverge > 3% | Ratio controlado |
| ML-005 | Casos frontera: valores en umbrales de clasificación | Predicción válida sin error |
| ML-006 | Entradas inesperadas: valores negativos, NaN, strings | Error controlado o predicción por defecto |

### 3.5 Pruebas de API (16.5)

Validar los endpoints REST del backend.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| API-001 | GET /api/health retorna 200 OK | Status 200, body.status === "OK" |
| API-002 | POST /api/auth/register con datos válidos | Status 201, token presente |
| API-003 | POST /api/auth/login con credenciales válidas | Status 200, token presente |
| API-004 | POST /api/auth/register sin campos obligatorios | Status 400 |
| API-005 | POST /api/auth/login con contraseña incorrecta | Status 401 |
| API-006 | GET /api/habits sin token de autenticación | Status 401 |
| API-007 | POST /api/habits con tipos de datos incorrectos | Status 400 |
| API-008 | GET /api/habits/:id con ID inexistente | Status 404 |
| API-009 | Latencia del endpoint /api/health < 200ms | Tiempo de respuesta aceptable |
| API-010 | Respuestas de error contienen formato JSON uniforme | Campos `success` y `message` presentes |
| API-011 | Concurrencia: 10 peticiones simultáneas sin errores 500 | Todas resueltas correctamente |

### 3.6 Pruebas de Integración (16.6)

Validar la comunicación entre componentes del sistema.

| Caso | Descripción | Criterio de Éxito |
| :--- | :--- | :--- |
| INT-001 | Conexión Socket.IO desde cliente web | Evento `connect` recibido |
| INT-002 | Emisión de `join_user_room` registra al usuario | Socket se une a room correcta |
| INT-003 | Persistencia: datos creados via API se recuperan tras reinicio | Datos intactos |
| INT-004 | Desconexión: cliente se desconecta y reconecta sin pérdida | Reconexión exitosa |
| INT-005 | Actualización de interfaz: evento de Socket actualiza datos en frontend | Datos reflejados en UI |

---

## 4. Entorno de Pruebas

| Componente | Detalle |
| :--- | :--- |
| **Sistema Operativo** | Windows 10/11 |
| **Node.js** | v18+ (ESM modules) |
| **Python** | 3.10+ |
| **Base de datos SQL** | MySQL (local o remota) |
| **Base de datos NoSQL** | MongoDB Atlas |
| **Framework JS** | Jest + Supertest |
| **Framework Python** | pytest |

---

## 5. Criterios de Aprobación

- **Cobertura:** Al menos el 90% de los casos de prueba definidos ejecutados.
- **Tasa de éxito:** Mínimo 85% de los casos de prueba pasan exitosamente.
- **Errores críticos:** Cero errores que impidan la funcionalidad principal.
- **Regresión:** Todas las pruebas que fallaron inicialmente pasan tras la corrección.

---

## 6. Cronograma

| Fase | Actividad | Duración |
| :--- | :--- | :--- |
| 1 | Configuración del entorno de pruebas | 1 día |
| 2 | Pruebas de Dataset y Simulación | 1 día |
| 3 | Pruebas de ETL y Modelos | 1 día |
| 4 | Pruebas de API | 1 día |
| 5 | Pruebas de Integración | 1 día |
| 6 | Documentación de resultados y conclusiones | 1 día |
