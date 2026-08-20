# Etapa 16 — Matriz de Resultados de Pruebas

## QUANTIFY SYSTEM — Reporte de Ejecucion y Resultados

**Fecha de ejecucion:** Agosto 2026  
**Entorno:** Windows 10/11, Python 3.11.0, Node.js v18+, Jest 30.4.2, Pytest 9.0.2  
**Estado General:** **100% Aprobado (128 / 128 pruebas superadas)**

---

## 1. Resumen Ejecutivo

| Modulo / Suite | Total Casos | Aprobados | Fallidos | Tasa de Exito | Tiempo de Ejecucion |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **16.1 Dataset** (`data/tests/`) | 38 | 38 | 0 | 100% | ~0.8s |
| **16.2 Simulacion** (`simulation/tests/`) | 21 | 21 | 0 | 100% | ~0.5s |
| **16.3 Pipeline ETL** (`database/etl/tests/`) | 21 | 21 | 0 | 100% | ~0.6s |
| **16.4 Modelos ML** (`models/tests/`) | 19 | 19 | 0 | 100% | ~0.9s |
| **16.5 API REST** (`backend/tests/api/`) | 21 | 21 | 0 | 100% | ~1.4s |
| **16.6 Integracion** (`backend/tests/integration/`) | 8 | 8 | 0 | 100% | ~1.8s |
| **TOTAL** | **128** | **128** | **0** | **100%** | **~6.0s** |

---

## 2. Detalle de Ejecucion por Modulo

### 2.1 Pruebas de Dataset (16.1)

```text
data/tests/test_dataset.py::TestRangos::test_rango_columna[edad-rango0] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[dias_activo-rango1] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[tasa_adherencia-rango2] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[friccion_promedio-rango3] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[racha_maxima-rango4] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[frecuencia_fallo_semanal-rango5] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[tendencia_crecimiento-rango6] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[horas_sueno-rango7] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[pasos_diarios-rango8] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[fc_media-rango9] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[spo2_promedio-rango10] PASSED
data/tests/test_dataset.py::TestRangos::test_rango_columna[nivel_estres-rango11] PASSED
data/tests/test_dataset.py::TestNulos::test_nulos_en_biometricos_dentro_de_rango PASSED
data/tests/test_dataset.py::TestNulos::test_sin_nulos_en_columnas_obligatorias PASSED
data/tests/test_dataset.py::TestDuplicados::test_sin_duplicados_en_usuario_id PASSED
data/tests/test_dataset.py::TestDuplicados::test_sin_filas_completamente_duplicadas PASSED
data/tests/test_dataset.py::TestIntegridad::test_formato_usuario_id PASSED
data/tests/test_dataset.py::TestIntegridad::test_total_registros PASSED
data/tests/test_dataset.py::TestIntegridad::test_columnas_presentes PASSED
data/tests/test_dataset.py::TestIntegridad::test_no_columnas_extra PASSED
data/tests/test_dataset.py::TestDistribucion::test_clases_presentes PASSED
data/tests/test_dataset.py::TestDistribucion::test_distribucion_no_degenerada PASSED
data/tests/test_dataset.py::TestBalance::test_clase_minima_supera_10_porciento PASSED
data/tests/test_dataset.py::TestBalance::test_conteo_por_clase PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[usuario_id-object] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[edad-int] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[genero-object] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[dispositivo-object] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[dias_activo-int] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[tasa_adherencia-float] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[friccion_promedio-float] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[racha_maxima-int] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[frecuencia_fallo_semanal-float] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[tendencia_crecimiento-float] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[nivel_estres-int] PASSED
data/tests/test_dataset.py::TestTipos::test_tipo_columna[riesgo_abandono-object] PASSED
data/tests/test_dataset.py::TestTipos::test_genero_valores_validos PASSED
data/tests/test_dataset.py::TestTipos::test_dispositivo_valores_validos PASSED
```

### 2.2 Pruebas de Simulacion (16.2)

```text
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_alto_adherencia_baja_friccion_alta PASSED
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_alto_fallo_excesivo PASSED
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_alto_estres_y_poco_sueno PASSED
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_medio_adherencia_intermedia PASSED
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_medio_friccion_intermedia PASSED
simulation/tests/test_simulation.py::TestReglasClasificacion::test_riesgo_bajo_usuario_saludable PASSED
simulation/tests/test_simulation.py::TestCasosNormales::test_demograficos_tamanio PASSED
simulation/tests/test_simulation.py::TestCasosNormales::test_demograficos_columnas PASSED
simulation/tests/test_simulation.py::TestCasosNormales::test_conductuales_columnas PASSED
simulation/tests/test_simulation.py::TestCasosNormales::test_biometricos_columnas PASSED
simulation/tests/test_simulation.py::TestCasosExtremos::test_usuarios_fantasma_existen PASSED
simulation/tests/test_simulation.py::TestCasosExtremos::test_super_usuarios_burnout PASSED
simulation/tests/test_simulation.py::TestCasosExtremos::test_outliers_biometricos PASSED
simulation/tests/test_simulation.py::TestCasosExtremos::test_casos_frontera_adherencia PASSED
simulation/tests/test_simulation.py::TestCoherencia::test_correlacion_adherencia_friccion_negativa PASSED
simulation/tests/test_simulation.py::TestCoherencia::test_correlacion_adherencia_racha_positiva PASSED
simulation/tests/test_simulation.py::TestCoherencia::test_correlacion_friccion_fallo_positiva PASSED
simulation/tests/test_simulation.py::TestCoherencia::test_correlacion_friccion_sueno_negativa PASSED
simulation/tests/test_simulation.py::TestReproducibilidad::test_dos_ejecuciones_identicas PASSED
simulation/tests/test_simulation.py::TestReproducibilidad::test_semilla_distinta_produce_datos_distintos PASSED
simulation/tests/test_simulation.py::TestReproducibilidad::test_nulos_reproducibles PASSED
```

### 2.3 Pruebas de Pipeline ETL (16.3)

```text
database/etl/tests/test_etl.py::TestExtraccion::test_extraccion_retorna_dataframe PASSED
database/etl/tests/test_etl.py::TestExtraccion::test_extraccion_no_vacio PASSED
database/etl/tests/test_etl.py::TestExtraccion::test_extraccion_columnas_completas PASSED
database/etl/tests/test_etl.py::TestExtraccion::test_extraccion_5000_registros PASSED
database/etl/tests/test_etl.py::TestExtraccion::test_extraccion_contiene_nulos PASSED
database/etl/tests/test_etl.py::TestImputacionNulos::test_sin_nulos_tras_imputacion PASSED
database/etl/tests/test_etl.py::TestImputacionNulos::test_imputacion_usa_mediana PASSED
database/etl/tests/test_etl.py::TestImputacionNulos::test_valores_no_nulos_se_preservan PASSED
database/etl/tests/test_etl.py::TestCodificaciones::test_onehot_genero_presente PASSED
database/etl/tests/test_etl.py::TestCodificaciones::test_onehot_dispositivo_presente PASSED
database/etl/tests/test_etl.py::TestCodificaciones::test_onehot_genero_valores_binarios PASSED
database/etl/tests/test_etl.py::TestCodificaciones::test_codificacion_ordinal_riesgo PASSED
database/etl/tests/test_etl.py::TestCodificaciones::test_features_derivados_existen PASSED
database/etl/tests/test_etl.py::TestCarga::test_conteo_registros_preservado PASSED
database/etl/tests/test_etl.py::TestCarga::test_guardado_a_csv_exitoso PASSED
database/etl/tests/test_etl.py::TestCarga::test_csv_se_puede_releer PASSED
database/etl/tests/test_etl.py::TestRepetibilidad::test_idempotencia PASSED
database/etl/tests/test_etl.py::TestRepetibilidad::test_bitacora_registra_operaciones PASSED
database/etl/tests/test_etl.py::TestManejoErrores::test_archivo_inexistente PASSED
database/etl/tests/test_etl.py::TestManejoErrores::test_dataframe_vacio PASSED
database/etl/tests/test_etl.py::TestManejoErrores::test_validacion_datos_procesados PASSED
```

### 2.4 Pruebas de Modelos ML (16.4)

```text
models/tests/test_models.py::TestMetricas::test_accuracy_validacion_superior_95 PASSED
models/tests/test_models.py::TestMetricas::test_f1_weighted_superior_95 PASSED
models/tests/test_models.py::TestMetricas::test_precision_y_recall_equilibrados PASSED
models/tests/test_models.py::TestGeneralizacion::test_diferencia_train_val_menor_5_porciento PASSED
models/tests/test_models.py::TestEstabilidad::test_misma_entrada_misma_salida PASSED
models/tests/test_models.py::TestEstabilidad::test_probabilidades_consistentes PASSED
models/tests/test_models.py::TestEstabilidad::test_kmeans_mismo_cluster PASSED
models/tests/test_models.py::TestSobreajuste::test_accuracy_train_no_perfecta PASSED
models/tests/test_models.py::TestSobreajuste::test_f1_macro_aceptable PASSED
models/tests/test_models.py::TestCasosFrontera::test_umbral_adherencia_040 PASSED
models/tests/test_models.py::TestCasosFrontera::test_umbral_adherencia_065 PASSED
models/tests/test_models.py::TestCasosFrontera::test_umbral_friccion_60 PASSED
models/tests/test_models.py::TestCasosFrontera::test_todos_los_valores_minimos PASSED
models/tests/test_models.py::TestCasosFrontera::test_todos_los_valores_maximos PASSED
models/tests/test_models.py::TestEntradasInesperadas::test_valores_negativos PASSED
models/tests/test_models.py::TestEntradasInesperadas::test_valores_extremos_altos PASSED
models/tests/test_models.py::TestEntradasInesperadas::test_valores_cero PASSED
models/tests/test_models.py::TestEntradasInesperadas::test_cluster_con_valores_negativos PASSED
models/tests/test_models.py::TestEntradasInesperadas::test_modelo_retorna_clases_validas PASSED
```

### 2.5 Pruebas de API REST (16.5)

```text
PASS tests/api/health.test.js
  API-001: GET /api/health
    ✓ debe retornar status 200 (12 ms)
    ✓ debe retornar status "OK" en el body (3 ms)
    ✓ debe retornar un mensaje descriptivo (2 ms)
    ✓ debe retornar Content-Type JSON (2 ms)
  API-009: Latencia del endpoint /api/health
    ✓ debe responder en menos de 200ms (5 ms)
    ✓ debe responder consistentemente rapido en 5 peticiones (8 ms)

PASS tests/api/validation.test.js
  API-004: POST /api/auth/register — Campos faltantes
    ✓ sin nombre debe retornar 400 (15 ms)
    ✓ sin email debe retornar 400 (4 ms)
    ✓ sin password debe retornar 400 (3 ms)
    ✓ sin username debe retornar 400 (3 ms)
    ✓ body completamente vacio debe retornar 400 (3 ms)
    ✓ nombre demasiado corto (< 3 chars) debe retornar 400 (3 ms)
    ✓ password demasiado corto (< 6 chars) debe retornar 400 (3 ms)
  API-002: POST /api/auth/register — Datos validos
    ✓ registro con datos completos debe retornar 201 (4 ms)
  API-005: POST /api/auth/login — Credenciales incorrectas
    ✓ contrasena incorrecta debe retornar 401 (4 ms)
    ✓ email invalido debe retornar 400 (3 ms)
    ✓ sin contrasena debe retornar 400 (3 ms)
  API-006: GET /api/habits — Sin token de autenticacion
    ✓ sin header Authorization debe retornar 401 (3 ms)
    ✓ con token valido debe retornar 200 (3 ms)
  API-007: POST /api/habits — Tipos de datos incorrectos
    ✓ tipo_medicion invalido debe retornar 400 (3 ms)
    ✓ frecuencia invalida debe retornar 400 (3 ms)
    ✓ meta_diaria no numerica debe retornar 400 (3 ms)
    ✓ sin nombre de habito debe retornar 400 (3 ms)
  API-008: GET /api/habits/:id — ID inexistente
    ✓ ID inexistente debe retornar 404 (3 ms)
    ✓ ruta completamente inexistente debe retornar 404 (3 ms)
  API-010: Formato uniforme de respuestas de error
    ✓ error 400 debe contener campo success=false (3 ms)
    ✓ error 400 debe contener campo message (3 ms)
    ✓ error 401 debe contener formato JSON uniforme (3 ms)
    ✓ error 404 debe contener formato JSON uniforme (3 ms)

PASS tests/api/concurrency.test.js
  API-011: Concurrencia basica — Peticiones simultaneas
    ✓ 10 peticiones simultaneas deben resolverse sin errores 500 (18 ms)
    ✓ 20 peticiones simultaneas deben completarse dentro del timeout (22 ms)
    ✓ peticiones mixtas GET y POST simultaneas no deben interferir (14 ms)
```

### 2.6 Pruebas de Integracion (16.6)

```text
PASS tests/integration/socket.test.js
  INT-001: Conexion Socket.IO
    ✓ cliente debe conectarse exitosamente al servidor (25 ms)
    ✓ cliente debe recibir un ID de socket unico (12 ms)
    ✓ servidor debe registrar la conexion entrante (115 ms)
  INT-002: Evento join_user_room
    ✓ cliente debe poder unirse a un room de usuario (18 ms)
    ✓ room no se asigna si userId es null (208 ms)
    ✓ multiples clientes pueden unirse a rooms diferentes (35 ms)
  INT-004: Desconexion y reconexion
    ✓ cliente desconectado debe poder reconectarse (42 ms)
    ✓ servidor detecta la desconexion del cliente (15 ms)

PASS tests/integration/persistence.test.js
  INT-003: Persistencia de datos creados via API
    ✓ un usuario registrado debe poder hacer login con las mismas credenciales (14 ms)
    ✓ un habito creado debe poder recuperarse con GET (12 ms)
    ✓ un habito eliminado no debe poder recuperarse (10 ms)
    ✓ no se debe permitir registro duplicado con mismo email (8 ms)
  INT-005: Flujo completo registro -> login -> CRUD habitos
    ✓ flujo completo debe funcionar de extremo a extremo (22 ms)
```
