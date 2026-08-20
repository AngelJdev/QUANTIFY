# Etapa 7 — Proceso ETL

## Propósito

Extraer, transformar y cargar los datos crudos de telemetría de QUANTIFY de manera reproducible, generando un dataset limpio y enriquecido listo para análisis exploratorio y modelado.

---

## 1. Diagrama del Flujo ETL

```text
┌─────────────────────────────────────────────────────┐
│                    EXTRACCIÓN                       │
│   data/raw/quantify_telemetry.csv                   │
│   • 5,000 registros, 16 columnas                    │
│   • 561 nulos en variables biométricas              │
└────────────────────────┬────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   TRANSFORMACIÓN                    │
│                                                     │
│   2.1 Eliminación de duplicados         (0 elim.)   │
│   2.2 Imputación de nulos (mediana)     (561→0)     │
│   2.3 Corrección de tipos               (int cast)  │
│   2.4 Validación de rangos              (clipping)  │
│   2.5 Codificación categórica           (One-Hot)   │
│   2.6 Ingeniería de características     (+4 feat.)  │
└────────────────────────┬────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                      CARGA                          │
│   data/processed/quantify_clean.csv                 │
│   • 5,000 registros, 27 columnas                    │
│   • 0 nulos, tipos verificados                      │
└────────────────────────┬────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    VALIDACIÓN                       │
│   ✓ Sin pérdida de registros                        │
│   ✓ Sin nulos en features críticas                  │
│   ✓ Rangos dentro de límites                        │
│   ✓ Codificaciones One-Hot presentes                │
│   ✓ Features derivados generados                    │
│   ✓ Tipos de datos correctos                        │
└─────────────────────────────────────────────────────┘
```

---

## 2. Bitácora de Transformaciones

| # | Operación | Columna(s) | Detalle |
| :---: | :--- | :--- | :--- |
| 1 | Eliminación de duplicados | `usuario_id` | 0 registros removidos |
| 2 | Imputación de nulos | `horas_sueno` | 134 nulos → mediana (6.1) |
| 3 | Imputación de nulos | `pasos_diarios` | 143 nulos → mediana (6,585) |
| 4 | Imputación de nulos | `fc_media` | 138 nulos → mediana (76.7) |
| 5 | Imputación de nulos | `spo2_promedio` | 146 nulos → mediana (96.4) |
| 6 | Corrección de tipo | `pasos_diarios` | float → int |
| 7 | Corrección de tipo | `nivel_estres` | Verificado como int |
| 8 | Codificación One-Hot | `genero` | → genero_Femenino, genero_Masculino, genero_No Binario |
| 9 | Codificación One-Hot | `dispositivo` | → disp_Smartwatch, disp_Web, disp_Web+Smartwatch |
| 10 | Codificación ordinal | `riesgo_abandono` | Bajo=0, Medio=1, Alto=2 |
| 11 | Feature derivado | `indice_riesgo_compuesto` | Ponderación: adherencia(35%), fricción(25%), fallo(20%), estrés(20%) |
| 12 | Feature derivado | `ratio_adherencia_friccion` | adherencia / fricción |
| 13 | Feature derivado | `grupo_edad` | Joven (16-24), Adulto (25-40), Senior (41+) |
| 14 | Feature derivado | `eficiencia_racha` | racha_maxima / dias_activo |

---

## 3. Reporte de Calidad

### Antes del ETL (raw)
| Métrica | Valor |
| :--- | :--- |
| Registros | 5,000 |
| Columnas | 16 |
| Nulos totales | 561 |
| Duplicados | 0 |

### Después del ETL (processed)
| Métrica | Valor |
| :--- | :--- |
| Registros | 5,000 |
| Columnas | 27 (+11 nuevas) |
| Nulos totales | 0 |
| Duplicados | 0 |

### Estrategia de imputación de nulos
Se utilizó la **mediana** en lugar de la media para las variables biométricas porque:
- La mediana es robusta a valores extremos (los outliers inyectados no la afectan).
- Mantiene la distribución central sin sesgarla hacia los valores atípicos.

---

## 4. Reproducibilidad

```bash
# Ejecutar el pipeline completo:
python database/etl/etl_pipeline.py

# El resultado en data/processed/quantify_clean.csv es idéntico en cada ejecución
# siempre que el archivo fuente (data/raw/quantify_telemetry.csv) no cambie.
```

---

## 5. Script

El código fuente completo se encuentra en: `database/etl/etl_pipeline.py`
