# Etapa 16 — Casos de Prueba

## QUANTIFY SYSTEM — Catalogo Completo de Casos de Prueba

**Version:** 1.0  
**Fecha:** Agosto 2026  
**Equipo:** QUANTIFY  

---

## Convenciones

| Prefijo | Componente |
| :--- | :--- |
| DS | Dataset |
| SIM | Simulacion |
| ETL | Pipeline ETL |
| ML | Modelos de Machine Learning |
| API | API REST |
| INT | Integracion |

---

## 16.1 Dataset

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| DS-001 | Rangos numericos de edad | `data/raw/quantify_telemetry.csv` | Todos los valores entre 16 y 65 | Positivo |
| DS-001b | Rangos de tasa_adherencia | CSV crudo | Valores entre 0.0 y 1.0 | Positivo |
| DS-001c | Rangos de friccion_promedio | CSV crudo | Valores entre 1.0 y 10.0 | Positivo |
| DS-001d | Rangos de nivel_estres | CSV crudo | Valores entre 1 y 5 | Positivo |
| DS-002 | Nulos en biometricos (~2.5%) | CSV crudo | Entre 1% y 5% por columna biometrica | Positivo |
| DS-002b | Sin nulos en columnas obligatorias | CSV crudo | 0 nulos en usuario_id, edad, genero, etc. | Negativo |
| DS-003 | Duplicados en usuario_id | CSV crudo | 0 duplicados | Negativo |
| DS-003b | Filas completamente duplicadas | CSV crudo | 0 filas duplicadas | Negativo |
| DS-004 | Formato de usuario_id | CSV crudo | 100% cumplen USR-XXXXX | Positivo |
| DS-004b | Total de registros | CSV crudo | Exactamente 5000 | Positivo |
| DS-005 | Clases de riesgo presentes | CSV crudo | Alto, Medio, Bajo | Positivo |
| DS-005b | Distribucion no degenerada | CSV crudo | Ninguna clase > 80% | Negativo |
| DS-006 | Balance minimo de clases | CSV crudo | Ninguna clase < 10% | Negativo |
| DS-007 | Tipos de datos correctos | CSV crudo | int para edad, float para adherencia, etc. | Positivo |
| DS-007b | Valores validos de genero | CSV crudo | Solo Masculino, Femenino, No Binario | Positivo |

---

## 16.2 Simulacion

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| SIM-001a | Riesgo alto: adherencia baja + friccion alta | adherencia=0.30, friccion=7.0 | "Alto" | Positivo |
| SIM-001b | Riesgo alto: fallo excesivo | fallo_semanal=5.0 | "Alto" | Positivo |
| SIM-001c | Riesgo alto: estres alto + poco sueno | estres=4, sueno=4.0 | "Alto" | Positivo |
| SIM-001d | Riesgo medio: adherencia intermedia | adherencia=0.50 | "Medio" | Positivo |
| SIM-001e | Riesgo medio: friccion intermedia | friccion=5.0 | "Medio" | Positivo |
| SIM-001f | Riesgo bajo: usuario saludable | adherencia=0.85, friccion=2.0 | "Bajo" | Positivo |
| SIM-002a | Generacion de demograficos | N=100 | DataFrame con 100 filas, 4 columnas | Positivo |
| SIM-002b | Generacion de conductuales | N=3, edades=[25,30,35] | DataFrame con 6 columnas | Positivo |
| SIM-003a | Usuarios fantasma | Dataset completo | Al menos 40 con dias_activo < 3 | Extremo |
| SIM-003b | Super usuarios con burnout | Dataset completo | Al menos 30 con adherencia > 0.95 y estres=5 | Extremo |
| SIM-003c | Outliers biometricos | Dataset completo | Al menos 25 con FC > 100 y SpO2 < 92 | Extremo |
| SIM-004a | Correlacion adherencia-friccion | Dataset completo | r < -0.30 | Coherencia |
| SIM-004b | Correlacion adherencia-racha | Dataset completo | r > 0.40 | Coherencia |
| SIM-005a | Reproducibilidad con semilla 2026 | 2 ejecuciones | DataFrames identicos | Reproducibilidad |
| SIM-005b | Semilla diferente produce datos distintos | Semillas 2026 vs 9999 | Edades diferentes | Reproducibilidad |

---

## 16.3 ETL

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| ETL-001a | Extraccion retorna DataFrame | CSV crudo | isinstance(result, pd.DataFrame) | Positivo |
| ETL-001b | DataFrame no vacio | CSV crudo | len > 0 | Positivo |
| ETL-001c | 16 columnas originales | CSV crudo | len(columns) == 16 | Positivo |
| ETL-002a | Sin nulos tras imputacion | CSV transformado | 0 nulos en features criticas | Positivo |
| ETL-002b | Imputacion usa mediana | Valores nulos | Reemplazo = mediana de la columna | Positivo |
| ETL-002c | Valores existentes se preservan | Antes vs despues | Valores no nulos sin cambios | Negativo |
| ETL-003a | One-Hot genero presente | CSV transformado | genero_Masculino, genero_Femenino, genero_No Binario | Positivo |
| ETL-003b | One-Hot dispositivo presente | CSV transformado | disp_Web, disp_Web+Smartwatch, disp_Smartwatch | Positivo |
| ETL-003c | Codificacion ordinal riesgo | CSV transformado | Valores {0, 1, 2} | Positivo |
| ETL-003d | Features derivados existen | CSV transformado | indice_riesgo_compuesto, ratio, grupo_edad, eficiencia | Positivo |
| ETL-004 | Conteo preservado | Antes vs despues | registros_out = registros_in - duplicados | Positivo |
| ETL-005 | Idempotencia | 2 ejecuciones | Resultados identicos | Reproducibilidad |
| ETL-006a | Archivo inexistente | Ruta invalida | FileNotFoundError | Error |
| ETL-006b | DataFrame vacio | DataFrame sin filas | Sin crash, resultado vacio | Error |

---

## 16.4 Modelos

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| ML-001a | Accuracy validacion RF > 95% | supervised_metrics.csv | acc > 0.95 | Metrica |
| ML-001b | F1-weighted > 95% | supervised_metrics.csv | f1 > 0.95 | Metrica |
| ML-001c | Precision-recall equilibrados | supervised_metrics.csv | diff < 0.05 | Metrica |
| ML-002 | Diferencia train-val < 5% | supervised_metrics.csv | abs(train - val) < 0.05 | Generalizacion |
| ML-003a | Misma entrada, misma salida RF | Vector de ejemplo | 3 predicciones iguales | Estabilidad |
| ML-003b | Probabilidades consistentes | Vector de ejemplo | Arrays identicos | Estabilidad |
| ML-003c | Mismo cluster KMeans | Vector de ejemplo | 2 asignaciones iguales | Estabilidad |
| ML-004a | Accuracy train no perfecta con val baja | Metricas | Si train=1.0, val >= 0.95 | Sobreajuste |
| ML-004b | F1-macro > 0.90 | Metricas | F1-macro aceptable | Sobreajuste |
| ML-005a | Umbral adherencia 0.40 | Vector con adh=0.40 | Prediccion valida | Frontera |
| ML-005b | Todos valores minimos | Vector minimo | Prediccion valida | Frontera |
| ML-005c | Todos valores maximos | Vector maximo | Prediccion valida | Frontera |
| ML-006a | Valores negativos | Vector con negativos | Sin crash | Inesperado |
| ML-006b | Valores extremos altos | pasos=999999, FC=500 | Sin crash | Inesperado |
| ML-006c | Vector de ceros | Todos los features en 0 | Sin crash | Inesperado |

---

## 16.5 API

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| API-001 | GET /api/health | N/A | 200 OK, status="OK" | Positivo |
| API-002 | POST /api/auth/register datos validos | Body completo | 201, token presente | Positivo |
| API-004a | Registro sin nombre | Body sin nombre | 400 | Negativo |
| API-004b | Registro sin email | Body sin email | 400 | Negativo |
| API-004c | Registro sin password | Body sin password | 400 | Negativo |
| API-004d | Registro body vacio | {} | 400, errors[] no vacio | Negativo |
| API-004e | Nombre < 3 chars | nombre="AB" | 400 | Negativo |
| API-004f | Password < 6 chars | password="123" | 400 | Negativo |
| API-005a | Login contrasena incorrecta | password erroneo | 401 | Negativo |
| API-005b | Login email invalido | email sin formato | 400 | Negativo |
| API-006 | GET /api/habits sin token | Sin Authorization | 401 | Negativo |
| API-007a | Habito tipo_medicion invalido | tipo="INVALIDO" | 400 | Negativo |
| API-007b | Habito frecuencia invalida | frecuencia="MENSUAL" | 400 | Negativo |
| API-007c | Habito meta no numerica | meta="treinta" | 400 | Negativo |
| API-008 | GET /api/habits/:id inexistente | id=99999 | 404 | Negativo |
| API-009 | Latencia /api/health | N/A | < 200ms | Rendimiento |
| API-010 | Formato de respuestas de error | Cualquier error | success=false, message presente | Formato |
| API-011 | 10 peticiones simultaneas | 10 GETs paralelos | Todas status 200, ninguna 500 | Concurrencia |

---

## 16.6 Integracion

| ID | Descripcion | Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| INT-001a | Conexion Socket.IO exitosa | Cliente socket.io-client | connected = true | Positivo |
| INT-001b | ID de socket unico | Cliente conectado | id definido, string no vacio | Positivo |
| INT-002a | join_user_room con userId | emit("join_user_room", 42) | room_joined con room="user_42" | Positivo |
| INT-002b | join_user_room con null | emit("join_user_room", null) | Sin asignacion de room | Negativo |
| INT-002c | Multiples clientes, rooms distintos | 2 clientes | Cada uno en su room | Positivo |
| INT-003a | Registro -> Login valido | Flujo secuencial | Login exitoso con mismas credenciales | Integracion |
| INT-003b | CRUD completo de habito | Crear -> Leer -> Eliminar | Cada paso exitoso | Integracion |
| INT-003c | Registro duplicado | Mismo email 2 veces | 400 en segundo intento | Negativo |
| INT-004a | Desconexion y reconexion | Disconnect -> Connect | connected = true, ID diferente | Resiliencia |
| INT-005 | Flujo E2E completo | Registro -> Login -> Crear -> Listar -> Eliminar | Todos los pasos exitosos | E2E |
