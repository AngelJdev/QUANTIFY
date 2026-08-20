# Etapa 5 — Reglas de Simulación del Dataset

## Propósito

Este documento describe las reglas deterministas utilizadas para generar el dataset sintético de telemetría de usuarios de QUANTIFY. La simulación NO es aleatoria: cada variable sigue distribuciones y correlaciones basadas en el contexto del proyecto.

## Configuración Base

| Parámetro | Valor |
| :--- | :--- |
| Semilla (`np.random.seed`) | `2026` |
| Total de registros | 5,000 (1 fila por usuario) |
| Script generador | `simulation/generate_dataset.py` |
| Salida | `data/raw/quantify_telemetry.csv` |

---

## 1. Variables Demográficas

### Edad
- **Distribución:** Normal(μ=28, σ=8), acotada [16, 65].
- **Justificación:** Público objetivo universitario y profesional joven.

### Género
- 55% Masculino, 35% Femenino, 10% No Binario.
- **Justificación:** Refleja la adopción tecnológica observada en plataformas de bienestar.

### Dispositivo
- 40% Web, 35% Web+Smartwatch, 25% Solo Smartwatch.
- **Justificación:** Representa la distribución esperada de usuarios.

---

## 2. Variables Conductuales (Con Correlaciones)

### Días Activos
- **Base:** Exponencial(λ=60), modificada por factor de edad.
- **Regla:** Usuarios <25 años → factor 0.7 (períodos más cortos); >40 → factor 1.3 (más constantes).
- **Rango:** [7, 180] días.

### Tasa de Adherencia Global
- **Base:** Beta(α=3.5, β=2.5), sesgo hacia adherencia moderada-alta.
- **Regla:** Penalización -0.08 para edad <20; -0.05 para edad >50.
- **Rango:** [0.05, 0.99].

### Fricción Promedio
- **Relación:** Inversamente proporcional a adherencia → `10 - (adherencia × 7) + ruido(σ=0.8)`.
- **Correlación esperada con adherencia:** r ≈ -0.50.
- **Rango:** [1.0, 10.0].

### Racha Máxima
- **Relación:** Proporcional a adherencia × días activos → `adherencia × dias × 0.45 + ruido(σ=5)`.
- **Correlación esperada con adherencia:** r ≈ 0.65.
- **Rango:** [1, 180] días.

### Frecuencia de Fallo Semanal
- **Relación:** Proporcional a fricción → `fricción × 0.5 + ruido(σ=0.5)`.
- **Correlación esperada con fricción:** r ≈ 0.55.
- **Rango:** [0.0, 7.0].

### Tendencia de Crecimiento
- **Fórmula:** `(adherencia - 0.5) × 1.2 - (fricción / 10) × 0.4 + ruido(σ=0.15)`.
- **Rango:** [-1.0, 1.0].

---

## 3. Variables Biométricas (Relaciones Fisiológicas)

### Horas de Sueño
- **Base:** Normal(μ=7, σ=1).
- **Regla:** Efecto negativo de fricción → `-0.15 × fricción`.
- **Correlación esperada con fricción:** r ≈ -0.35.
- **Rango:** [3.0, 10.0].

### Pasos Diarios
- **Base:** LogNormal(μ=8.8, σ=0.5).
- **Rango:** [500, 30,000].

### Frecuencia Cardíaca Media (bpm)
- **Base:** Normal(μ=72, σ=8).
- **Reglas:** Incremento por edad → `(edad - 30) × 0.15`; por estrés → `fricción × 0.8`.
- **Rango:** [50, 110].

### SpO2 Promedio (%)
- **Base:** Normal(μ=97, σ=1).
- **Regla:** Reducción por estrés → `-0.1 × fricción`.
- **Rango:** [90, 100].

### Nivel de Estrés (1-5)
- **Derivado compuesto:** `(fricción/10)×2.5 + ((10-sueño)/7)×1.5 + ((FC-60)/50)×1.0`.
- **Tipo:** Variable categórica ordinal.

---

## 4. Etiqueta Supervisada: `riesgo_abandono`

### Umbrales de Clasificación

| Riesgo | Condiciones (OR lógico) |
| :--- | :--- |
| **Alto** | `adherencia < 0.40 AND fricción > 6.0` — ó — `fallo_semanal > 4.5` — ó — `estrés ≥ 4 AND sueño < 5.5` |
| **Medio** | `adherencia ∈ [0.40, 0.65)` — ó — `fricción ∈ [4.5, 6.0]` — ó — `estrés ≥ 3 AND tendencia < 0` |
| **Bajo** | Ninguna condición anterior se cumple |

### Distribución Observada
| Clase | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| Medio | 3,039 | 60.8% |
| Alto | 1,059 | 21.2% |
| Bajo | 902 | 18.0% |

---

## 5. Casos Anómalos y Extremos (150 registros)

| Tipo | Cantidad | Descripción |
| :--- | :---: | :--- |
| Usuarios fantasma | 45 | días_activo ∈ [0, 2], adherencia ≈ 0, racha = 0 |
| Súper usuarios con burnout | 37 | adherencia > 0.95 pero estrés = 5, sueño < 4.5h, FC > 95 |
| Outliers biométricos | 38 | FC > 100 bpm con SpO2 < 92% |
| Casos frontera | 30 | Valores exactos en umbrales de clasificación |

---

## 6. Valores Nulos Controlados

- **Columnas afectadas:** `horas_sueno`, `pasos_diarios`, `fc_media`, `spo2_promedio`.
- **Tasa:** ~2.5% por columna (probabilidad uniforme por registro).
- **Justificación:** Simula desconexión de sensores del smartwatch o errores de transmisión.

---

## 7. Reproducibilidad

```bash
# Reproducir exactamente el mismo dataset:
python simulation/generate_dataset.py
# Verificar hash del archivo:
# El archivo data/raw/quantify_telemetry.csv debe ser idéntico en cada ejecución.
```
