"""
==============================================================================
QUANTIFY — Generador Determinista de Dataset de Telemetría de Usuarios
==============================================================================

Etapa 5 del Proyecto Integrador: Simulación Estratégica del Dataset.
Metodología: CRISP-DM (Fase 2 — Comprensión de los Datos).

Este script genera un dataset sintético que replica 6 meses de telemetría
conductual y biométrica de usuarios de la plataforma QUANTIFY.

Semilla: np.random.seed(2026)
Registros: ~5,000
Reproducibilidad: 100% determinista

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import numpy as np
import pandas as pd
from pathlib import Path

# ============================================================================
# CONFIGURACIÓN GLOBAL
# ============================================================================
SEED = 2026
np.random.seed(SEED)

N_USERS = 5000  # Total de registros (1 fila por usuario)
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
OUTPUT_FILE = OUTPUT_DIR / "quantify_telemetry.csv"

# ============================================================================
# 1. GENERACIÓN DE VARIABLES DEMOGRÁFICAS
# ============================================================================

def generate_demographics(n: int) -> pd.DataFrame:
    """
    Genera variables demográficas base con distribuciones realistas.

    Reglas:
    - Edad: Distribución normal centrada en 28 años (público universitario/joven profesional).
    - Género: 55% Masculino, 35% Femenino, 10% No Binario (reflejo de adopción tech).
    - Tipo de dispositivo: 40% solo Web, 35% Web+Smartwatch, 25% solo Smartwatch.
    """
    edad = np.clip(np.random.normal(loc=28, scale=8, size=n), 16, 65).astype(int)

    genero = np.random.choice(
        ["Masculino", "Femenino", "No Binario"],
        size=n,
        p=[0.55, 0.35, 0.10]
    )

    dispositivo = np.random.choice(
        ["Web", "Web+Smartwatch", "Smartwatch"],
        size=n,
        p=[0.40, 0.35, 0.25]
    )

    return pd.DataFrame({
        "usuario_id": [f"USR-{str(i).zfill(5)}" for i in range(1, n + 1)],
        "edad": edad,
        "genero": genero,
        "dispositivo": dispositivo
    })


# ============================================================================
# 2. GENERACIÓN DE VARIABLES CONDUCTUALES
# ============================================================================

def generate_behavioral(n: int, edad: np.ndarray) -> pd.DataFrame:
    """
    Genera variables de comportamiento con correlaciones realistas.

    Reglas de correlación:
    - Usuarios más jóvenes (<25) tienden a mayor frecuencia de fallo pero
      también mayor tasa de adherencia inicial (entusiasmo).
    - Usuarios entre 25-40 muestran adherencia más estable pero menor racha
      máxima (rutina laboral limita tiempo).
    - Usuarios >40 tienden a menor fricción percibida pero menor actividad.

    Relaciones clave:
    - tasa_adherencia ↔ racha_maxima: Correlación positiva (~0.65).
    - friccion_promedio ↔ tasa_adherencia: Correlación negativa (~-0.50).
    - frecuencia_fallo ↔ friccion: Correlación positiva (~0.55).
    """

    # Días activos: Rango de 7 a 180 días (6 meses máximo)
    # Usuarios jóvenes tienden a períodos más cortos pero intensos
    base_dias = np.random.exponential(scale=60, size=n)
    factor_edad = np.where(edad < 25, 0.7, np.where(edad > 40, 1.3, 1.0))
    dias_activo = np.clip(base_dias * factor_edad, 7, 180).astype(int)

    # Tasa de adherencia global (0.0 a 1.0)
    # Base con distribución beta sesgada a la derecha (la mayoría tiene adherencia moderada)
    base_adherencia = np.random.beta(a=3.5, b=2.5, size=n)
    # Penalización por edad extrema
    penalizacion_edad = np.where(edad < 20, -0.08, np.where(edad > 50, -0.05, 0.0))
    tasa_adherencia = np.clip(base_adherencia + penalizacion_edad, 0.05, 0.99)

    # Fricción promedio (1.0 a 10.0)
    # Inversamente correlacionada con adherencia + ruido
    base_friccion = 10.0 - (tasa_adherencia * 7.0)
    ruido_friccion = np.random.normal(0, 0.8, size=n)
    friccion_promedio = np.clip(base_friccion + ruido_friccion, 1.0, 10.0)

    # Racha máxima (días consecutivos)
    # Correlación fuerte con adherencia y días activos
    base_racha = tasa_adherencia * dias_activo * 0.45
    ruido_racha = np.random.normal(0, 5, size=n)
    racha_maxima = np.clip(base_racha + ruido_racha, 1, 180).astype(int)

    # Frecuencia de fallo semanal (0 a 7)
    # Correlación positiva con fricción
    base_fallo = friccion_promedio * 0.5
    ruido_fallo = np.random.normal(0, 0.5, size=n)
    frecuencia_fallo_semanal = np.clip(base_fallo + ruido_fallo, 0, 7).round(1)

    # Tendencia de crecimiento (-1.0 a 1.0)
    # Positiva cuando adherencia es alta y fricción baja
    tendencia = (tasa_adherencia - 0.5) * 1.2 - (friccion_promedio / 10.0) * 0.4
    ruido_tendencia = np.random.normal(0, 0.15, size=n)
    tendencia_crecimiento = np.clip(tendencia + ruido_tendencia, -1.0, 1.0).round(3)

    return pd.DataFrame({
        "dias_activo": dias_activo,
        "tasa_adherencia": tasa_adherencia.round(4),
        "friccion_promedio": friccion_promedio.round(2),
        "racha_maxima": racha_maxima,
        "frecuencia_fallo_semanal": frecuencia_fallo_semanal,
        "tendencia_crecimiento": tendencia_crecimiento
    })


# ============================================================================
# 3. GENERACIÓN DE VARIABLES BIOMÉTRICAS
# ============================================================================

def generate_biometrics(n: int, edad: np.ndarray, friccion: np.ndarray) -> pd.DataFrame:
    """
    Genera variables biométricas con relaciones fisiológicas reales.

    Reglas:
    - Horas de sueño: Distribución normal centrada en 7h. Usuarios con alta
      fricción duermen menos (correlación ~-0.35).
    - Pasos diarios: Log-normal. Usuarios con smartwatch registran más pasos.
    - Frecuencia cardíaca media: Normal centrada en 72 bpm. Se eleva con
      estrés (fricción alta) y edad.
    - SpO2 promedio: Normal centrada en 97%. Baja ligeramente con estrés.
    - Nivel de estrés (1-5): Derivado de fricción, sueño y FC.
    """

    # Horas de sueño
    base_sueno = np.random.normal(7.0, 1.0, size=n)
    efecto_friccion_sueno = -0.15 * friccion
    horas_sueno = np.clip(base_sueno + efecto_friccion_sueno, 3.0, 10.0).round(1)

    # Pasos diarios
    base_pasos = np.random.lognormal(mean=8.8, sigma=0.5, size=n)
    pasos_diarios = np.clip(base_pasos, 500, 30000).astype(int)

    # Frecuencia cardíaca media (bpm)
    base_fc = np.random.normal(72, 8, size=n)
    efecto_edad_fc = (edad - 30) * 0.15
    efecto_estres_fc = friccion * 0.8
    fc_media = np.clip(base_fc + efecto_edad_fc + efecto_estres_fc, 50, 110).round(1)

    # SpO2 promedio (%)
    base_spo2 = np.random.normal(97.0, 1.0, size=n)
    efecto_estres_spo2 = -0.1 * friccion
    spo2_promedio = np.clip(base_spo2 + efecto_estres_spo2, 90.0, 100.0).round(1)

    # Nivel de estrés (1-5) — derivado compuesto
    estres_score = (
        (friccion / 10.0) * 2.5 +
        ((10.0 - horas_sueno) / 7.0) * 1.5 +
        ((fc_media - 60) / 50.0) * 1.0
    )
    nivel_estres = np.clip(np.round(estres_score), 1, 5).astype(int)

    return pd.DataFrame({
        "horas_sueno": horas_sueno,
        "pasos_diarios": pasos_diarios,
        "fc_media": fc_media,
        "spo2_promedio": spo2_promedio,
        "nivel_estres": nivel_estres
    })


# ============================================================================
# 4. GENERACIÓN DE ETIQUETA SUPERVISADA (VARIABLE OBJETIVO)
# ============================================================================

def generate_risk_label(df: pd.DataFrame) -> pd.Series:
    """
    Genera la etiqueta de riesgo de abandono basada en reglas lógicas.

    Reglas de clasificación (NO aleatorias):
    ─────────────────────────────────────────
    ALTO riesgo cuando:
      - tasa_adherencia < 0.40  Y  friccion_promedio > 6.0
      - O frecuencia_fallo_semanal > 4.5
      - O (nivel_estres >= 4  Y  horas_sueno < 5.5)

    MEDIO riesgo cuando:
      - tasa_adherencia entre 0.40 y 0.65
      - O friccion_promedio entre 4.5 y 6.0
      - O (nivel_estres >= 3  Y  tendencia_crecimiento < 0.0)

    BAJO riesgo cuando:
      - Ninguna condición anterior se cumple
      - Típicamente: adherencia > 0.65, fricción < 4.5, estrés bajo

    Distribución objetivo: ~30% Alto, ~35% Medio, ~35% Bajo
    (Se permite variación natural por las reglas)
    """

    conditions_alto = (
        ((df["tasa_adherencia"] < 0.40) & (df["friccion_promedio"] > 6.0)) |
        (df["frecuencia_fallo_semanal"] > 4.5) |
        ((df["nivel_estres"] >= 4) & (df["horas_sueno"] < 5.5))
    )

    conditions_medio = (
        ((df["tasa_adherencia"] >= 0.40) & (df["tasa_adherencia"] < 0.65)) |
        ((df["friccion_promedio"] >= 4.5) & (df["friccion_promedio"] <= 6.0)) |
        ((df["nivel_estres"] >= 3) & (df["tendencia_crecimiento"] < 0.0))
    )

    riesgo = pd.Series("Bajo", index=df.index)
    riesgo[conditions_medio] = "Medio"
    riesgo[conditions_alto] = "Alto"

    return riesgo


# ============================================================================
# 5. INYECCIÓN DE CASOS ANÓMALOS Y EXTREMOS
# ============================================================================

def inject_anomalies(df: pd.DataFrame, n_anomalies: int = 150) -> pd.DataFrame:
    """
    Inyecta casos anómalos y extremos para enriquecer el dataset.

    Tipos de anomalías:
    - Usuarios fantasma: 0 días activo pero con biométricos normales (bots).
    - Súper usuarios: Adherencia perfecta (0.99) con estrés extremo (5).
    - Outliers biométricos: FC > 100 bpm con SpO2 < 92%.
    - Registros frontera: Exactamente en los umbrales de clasificación.
    """
    df = df.copy()
    indices = np.random.choice(df.index, size=n_anomalies, replace=False)

    # Tipo 1: Usuarios fantasma (~30% de anomalías)
    ghost_idx = indices[:45]
    df.loc[ghost_idx, "dias_activo"] = np.random.randint(0, 3, size=len(ghost_idx))
    df.loc[ghost_idx, "tasa_adherencia"] = np.random.uniform(0.0, 0.05, size=len(ghost_idx)).round(4)
    df.loc[ghost_idx, "racha_maxima"] = 0

    # Tipo 2: Súper usuarios con burnout (~25% de anomalías)
    super_idx = indices[45:82]
    df.loc[super_idx, "tasa_adherencia"] = np.random.uniform(0.95, 0.99, size=len(super_idx)).round(4)
    df.loc[super_idx, "nivel_estres"] = 5
    df.loc[super_idx, "horas_sueno"] = np.random.uniform(3.5, 4.5, size=len(super_idx)).round(1)
    df.loc[super_idx, "fc_media"] = np.random.uniform(95, 110, size=len(super_idx)).round(1)

    # Tipo 3: Outliers biométricos (~25% de anomalías)
    bio_idx = indices[82:120]
    df.loc[bio_idx, "fc_media"] = np.random.uniform(100, 115, size=len(bio_idx)).round(1)
    df.loc[bio_idx, "spo2_promedio"] = np.random.uniform(89, 92, size=len(bio_idx)).round(1)

    # Tipo 4: Casos frontera (~20% de anomalías)
    border_idx = indices[120:]
    df.loc[border_idx, "tasa_adherencia"] = np.random.choice(
        [0.39, 0.40, 0.41, 0.64, 0.65, 0.66], size=len(border_idx)
    )
    df.loc[border_idx, "friccion_promedio"] = np.random.choice(
        [4.4, 4.5, 4.6, 5.9, 6.0, 6.1], size=len(border_idx)
    )

    return df


# ============================================================================
# 6. GENERACIÓN DE NULOS CONTROLADOS
# ============================================================================

def inject_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Inyecta valores nulos de forma controlada (~2-3% por columna biométrica).
    Simula datos faltantes por desconexión de sensores del smartwatch.
    """
    df = df.copy()
    biometric_cols = ["horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"]

    for col in biometric_cols:
        mask = np.random.random(size=len(df)) < 0.025  # ~2.5% nulos
        df.loc[mask, col] = np.nan

    return df


# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

def main():
    print("=" * 70)
    print("QUANTIFY — Generador Determinista de Dataset (Etapa 5)")
    print(f"Semilla: {SEED} | Registros: {N_USERS}")
    print("=" * 70)

    # Paso 1: Variables demográficas
    print("\n[1/7] Generando variables demográficas...")
    df_demo = generate_demographics(N_USERS)

    # Paso 2: Variables conductuales
    print("[2/7] Generando variables conductuales (con correlaciones)...")
    df_behavior = generate_behavioral(N_USERS, df_demo["edad"].values)

    # Paso 3: Variables biométricas
    print("[3/7] Generando variables biométricas...")
    df_bio = generate_biometrics(
        N_USERS,
        df_demo["edad"].values,
        df_behavior["friccion_promedio"].values
    )

    # Paso 4: Ensamblar dataset completo
    print("[4/7] Ensamblando dataset completo...")
    df = pd.concat([df_demo, df_behavior, df_bio], axis=1)

    # Paso 5: Inyectar anomalías
    print("[5/7] Inyectando casos anómalos y extremos (150 registros)...")
    df = inject_anomalies(df, n_anomalies=150)

    # Paso 6: Generar etiqueta supervisada
    print("[6/7] Generando etiqueta de riesgo de abandono (reglas lógicas)...")
    df["riesgo_abandono"] = generate_risk_label(df)

    # Paso 7: Inyectar nulos controlados
    print("[7/7] Inyectando valores nulos controlados (~2.5% biométricos)...")
    df = inject_missing_values(df)

    # Guardar
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")
    print(f"\n✅ Dataset guardado en: {OUTPUT_FILE}")

    # Resumen estadístico
    print("\n" + "=" * 70)
    print("RESUMEN ESTADÍSTICO")
    print("=" * 70)
    print(f"  Total registros: {len(df)}")
    print(f"  Columnas: {list(df.columns)}")
    print(f"\n  Distribución de riesgo_abandono:")
    dist = df["riesgo_abandono"].value_counts()
    for label, count in dist.items():
        pct = count / len(df) * 100
        print(f"    {label}: {count} ({pct:.1f}%)")

    print(f"\n  Valores nulos por columna:")
    nulls = df.isnull().sum()
    for col, count in nulls[nulls > 0].items():
        print(f"    {col}: {count} ({count/len(df)*100:.1f}%)")

    print(f"\n  Resumen numérico:")
    print(df.describe().round(2).to_string())

    print(f"\n  Anomalías inyectadas: 150 registros")
    print(f"    - Usuarios fantasma (dias_activo < 3): {(df['dias_activo'] < 3).sum()}")
    print(f"    - Súper usuarios con burnout (adh > 0.95 & estrés = 5): "
          f"{((df['tasa_adherencia'] > 0.95) & (df['nivel_estres'] == 5)).sum()}")
    print(f"    - Outliers biométricos (FC > 100 & SpO2 < 92): "
          f"{((df['fc_media'] > 100) & (df['spo2_promedio'] < 92)).sum()}")

    print("\n" + "=" * 70)
    print("Generación completada exitosamente.")
    print("=" * 70)

    return df


if __name__ == "__main__":
    main()
