# Etapa 5 — Documentación del Dataset Simulado

## Descripción General

El dataset `data/raw/quantify_telemetry.csv` contiene 5,000 registros simulados de telemetría de usuarios de la plataforma QUANTIFY, representando 6 meses de actividad.

## Diccionario de Datos

| Variable | Tipo | Descripción | Rango | Clasificación |
| :--- | :---: | :--- | :--- | :--- |
| `usuario_id` | String | Identificador único del usuario | USR-00001 a USR-05000 | Nominal |
| `edad` | Int | Edad del usuario en años | [16, 65] | Cuantitativo discreto |
| `genero` | String | Género del usuario | Masculino, Femenino, No Binario | Cualitativo nominal |
| `dispositivo` | String | Tipo de dispositivo | Web, Web+Smartwatch, Smartwatch | Cualitativo nominal |
| `dias_activo` | Int | Total de días con actividad registrada | [0, 180] | Cuantitativo discreto |
| `tasa_adherencia` | Float | Proporción de cumplimiento global | [0.0, 0.99] | Cuantitativo continuo |
| `friccion_promedio` | Float | Índice de dificultad percibida | [1.0, 10.0] | Cuantitativo continuo |
| `racha_maxima` | Int | Mayor racha consecutiva en días | [0, 180] | Cuantitativo discreto |
| `frecuencia_fallo_semanal` | Float | Promedio de fallos por semana | [0.0, 7.0] | Cuantitativo continuo |
| `tendencia_crecimiento` | Float | Pendiente de mejora temporal | [-1.0, 1.0] | Cuantitativo continuo |
| `horas_sueno` | Float | Promedio de horas de sueño diarias | [3.0, 10.0] | Cuantitativo continuo |
| `pasos_diarios` | Int | Promedio de pasos por día | [500, 30000] | Cuantitativo discreto |
| `fc_media` | Float | Frecuencia cardíaca media en reposo (bpm) | [50, 115] | Cuantitativo continuo |
| `spo2_promedio` | Float | Saturación de oxígeno en sangre (%) | [89, 100] | Cuantitativo continuo |
| `nivel_estres` | Int | Nivel compuesto de estrés | [1, 5] | Cualitativo ordinal |
| `riesgo_abandono` | String | **Variable objetivo** — Nivel de riesgo | Bajo, Medio, Alto | Cualitativo ordinal |

## Fuentes de Información Simuladas

| Fuente Simulada | Equivalente Real | Variables |
| :--- | :--- | :--- |
| MySQL (OLTP) | Tabla `users` + `habits` | usuario_id, edad, genero, dias_activo, tasa_adherencia, racha_maxima |
| MongoDB (OLTP) | Colección `logs` + `telemetry` | friccion_promedio, frecuencia_fallo, tendencia_crecimiento |
| Smartwatch Wear OS | Sensores biométricos | horas_sueno, pasos_diarios, fc_media, spo2_promedio |
| Derivado ETL | Cálculo compuesto | nivel_estres, riesgo_abandono |

## Estadísticas Descriptivas del Dataset Generado

| Métrica | edad | dias_activo | tasa_adherencia | friccion_promedio | racha_maxima |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Media | 28.09 | 52.49 | 0.57 | 5.96 | 13.84 |
| Desviación Estándar | 7.67 | 47.28 | 0.20 | 1.51 | 14.08 |
| Mínimo | 16 | 0 | 0.00 | 1.84 | 0 |
| Máximo | 58 | 180 | 0.99 | 10.00 | 83 |

## Distribución de la Variable Objetivo

| Clase | Cantidad | Porcentaje |
| :---: | :---: | :---: |
| Bajo | 902 | 18.0% |
| Medio | 3,039 | 60.8% |
| Alto | 1,059 | 21.2% |

> [!IMPORTANT]
> El dataset presenta desbalance moderado. La clase "Medio" domina (~61%). Se deberá evaluar si se requiere SMOTE o sub-muestreo en la etapa de preparación (Etapa 9).

## Calidad del Dataset

- **Nulos controlados:** ~2.5% en columnas biométricas (simula fallos de sensores).
- **Anomalías inyectadas:** 150 registros (3%) con comportamientos atípicos documentados.
- **Reproducibilidad:** 100% determinista con `np.random.seed(2026)`.
