# Etapa 6 — Modelado de Data Warehouse (Esquema Estrella)

## Propósito

Diseñar un almacén de datos analítico orientado a la extracción de conocimiento mediante modelos de Machine Learning. El esquema permite consultas OLAP rápidas sobre la telemetría de usuarios sin afectar las bases de datos transaccionales (MySQL y MongoDB).

---

## 1. Selección del Esquema

Se seleccionó el **Esquema Estrella (Star Schema)** por las siguientes razones:

| Criterio | Justificación |
| :--- | :--- |
| **Simplicidad de consultas** | Las JOINs se realizan directamente desde la tabla de hechos a cada dimensión, sin pasos intermedios. |
| **Rendimiento analítico** | Optimizado para agregaciones (SUM, AVG, COUNT) sobre grandes volúmenes de telemetría. |
| **Compatibilidad con ML** | La tabla de hechos actúa como el vector de features que alimenta directamente los modelos. |
| **Facilidad de mantenimiento** | Dimensiones independientes permiten agregar nuevas categorías sin reestructurar. |

---

## 2. Granularidad

> **Un registro por usuario por snapshot de telemetría.**

Cada fila de `fact_user_telemetry` representa el estado acumulado de un usuario en un momento dado (snapshot periódico). Esto permite:
- Analizar tendencias temporales por usuario.
- Comparar cohortes de usuarios en diferentes períodos.
- Alimentar los modelos ML con features actualizados.

---

## 3. Diagrama del Esquema Estrella

```text
                    ┌──────────────────┐
                    │   dim_tiempo     │
                    │──────────────────│
                    │ tiempo_id (PK)   │
                    │ fecha            │
                    │ dia_semana       │
                    │ mes / trimestre  │
                    │ anio             │
                    └────────┬─────────┘
                             │
┌──────────────────┐         │         ┌──────────────────┐
│  dim_usuario     │         │         │  dim_habito      │
│──────────────────│         │         │──────────────────│
│ usuario_dim_id   │         │         │ habito_dim_id    │
│ usuario_id       │         │         │ tipo_medicion    │
│ edad             │         │         │ frecuencia       │
│ grupo_edad       ├─────────┤─────────┤ categoria        │
│ genero           │         │         │ unidad           │
│ dispositivo      │         │         │ meta_promedio    │
│ cluster_id       │  ┌──────┴──────┐  └──────────────────┘
└──────────────────┘  │   FACT      │
                      │  user      │
                      │ telemetry  │
┌──────────────────┐  │            │  ┌──────────────────┐
│ dim_dispositivo  │  │ fact_id    │  │ dim_nivel_riesgo │
│──────────────────│  │ medidas:   │  │──────────────────│
│ dispositivo_id   │  │  conducta  │  │ riesgo_dim_id    │
│ tipo             ├──┤  biométr.  ├──┤ nivel            │
│ sistema_op       │  │  ML infer. │  │ descripcion      │
│ tiene_sensores   │  └────────────┘  │ accion_recomend. │
└──────────────────┘                  └──────────────────┘
```

---

## 4. Tabla de Hechos: `fact_user_telemetry`

### Medidas Conductuales

| Medida | Tipo | Descripción |
| :--- | :---: | :--- |
| `dias_activo` | INT | Total de días con actividad registrada |
| `tasa_adherencia` | DECIMAL | Proporción de cumplimiento global |
| `friccion_promedio` | DECIMAL | Índice de dificultad percibida |
| `racha_maxima` | INT | Mayor racha consecutiva (días) |
| `frecuencia_fallo_semanal` | DECIMAL | Promedio de fallos semanales |
| `tendencia_crecimiento` | DECIMAL | Pendiente de mejora temporal |

### Medidas Biométricas

| Medida | Tipo | Descripción |
| :--- | :---: | :--- |
| `horas_sueno` | DECIMAL | Promedio de horas de sueño |
| `pasos_diarios` | INT | Promedio de pasos por día |
| `fc_media` | DECIMAL | Frecuencia cardíaca en reposo (bpm) |
| `spo2_promedio` | DECIMAL | Saturación de oxígeno (%) |
| `nivel_estres` | INT | Nivel compuesto de estrés (1-5) |

### Medidas de Inferencia ML

| Medida | Tipo | Descripción |
| :--- | :---: | :--- |
| `riesgo_predicho` | VARCHAR | Resultado del modelo supervisado |
| `probabilidad_riesgo` | DECIMAL | Confianza de la predicción |
| `cluster_asignado` | INT | Resultado del modelo no supervisado |
| `distancia_centroide` | DECIMAL | Distancia al centroide del cluster |
| `modelo_version` | VARCHAR | Versión del modelo utilizado |

---

## 5. Dimensiones

| Dimensión | Clave Primaria | Propósito |
| :--- | :--- | :--- |
| `dim_tiempo` | `tiempo_id` | Segmentar por fecha, semana, mes, trimestre |
| `dim_usuario` | `usuario_dim_id` | Segmentar por demografía y cluster |
| `dim_habito` | `habito_dim_id` | Segmentar por tipo y categoría de hábito |
| `dim_dispositivo` | `dispositivo_dim_id` | Segmentar por canal de registro |
| `dim_nivel_riesgo` | `riesgo_dim_id` | Catálogo de niveles de riesgo con acciones |

---

## 6. Script DDL

El script completo se encuentra en:

```
database/warehouse/star_schema.sql
```

Incluye: Tablas, datos iniciales de dimensión de riesgo, índices analíticos y vista de resumen.
