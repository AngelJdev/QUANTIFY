"""
==============================================================================
QUANTIFY — Pipeline ETL Reproducible
==============================================================================

Etapa 7 del Proyecto Integrador.
Metodología CRISP-DM: Fase 3 — Preparación de los Datos.

Flujo:
  Extracción (data/raw/) → Transformación → Carga (data/processed/)

Semilla: 2026 (misma del generador)
Reproducibilidad: 100% determinista

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

SEED = 2026
np.random.seed(SEED)

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
INPUT_FILE = RAW_DIR / "quantify_telemetry.csv"
OUTPUT_FILE = PROCESSED_DIR / "quantify_clean.csv"


# ============================================================================
# 1. EXTRACCIÓN
# ============================================================================

def extract(filepath: Path) -> pd.DataFrame:
    """
    Extrae los datos desde el archivo CSV crudo.

    Registro:
    - Fuente: data/raw/quantify_telemetry.csv
    - Formato: CSV (UTF-8, delimitador coma)
    - Generado por: simulation/generate_dataset.py
    """
    print("=" * 70)
    print("FASE 1: EXTRACCIÓN")
    print("=" * 70)

    df = pd.read_csv(filepath)

    print(f"  Fuente: {filepath}")
    print(f"  Formato: CSV (UTF-8)")
    print(f"  Fecha de extracción: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Registros extraídos: {len(df)}")
    print(f"  Columnas: {len(df.columns)}")
    print(f"  Tamaño en memoria: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")

    # Registrar problemas encontrados
    print(f"\n  Problemas detectados en extracción:")
    nulls = df.isnull().sum()
    if nulls.sum() > 0:
        print(f"    - Valores nulos encontrados: {nulls.sum()} total")
        for col, count in nulls[nulls > 0].items():
            print(f"      {col}: {count} ({count/len(df)*100:.1f}%)")
    else:
        print(f"    - Sin valores nulos")

    duplicados = df.duplicated(subset=["usuario_id"]).sum()
    print(f"    - Registros duplicados por usuario_id: {duplicados}")

    return df


# ============================================================================
# 2. TRANSFORMACIÓN
# ============================================================================

def transform(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aplica todas las transformaciones necesarias para preparar los datos
    para análisis exploratorio y modelado.
    """
    print("\n" + "=" * 70)
    print("FASE 2: TRANSFORMACIÓN")
    print("=" * 70)

    df = df.copy()
    log = []  # Bitácora de transformaciones

    # ── 2.1 Eliminación de duplicados ──
    n_before = len(df)
    df = df.drop_duplicates(subset=["usuario_id"], keep="first")
    n_removed = n_before - len(df)
    log.append(f"Eliminación de duplicados: {n_removed} registros removidos")
    print(f"\n  [2.1] Eliminación de duplicados: {n_removed} removidos")

    # ── 2.2 Tratamiento de nulos ──
    print(f"  [2.2] Tratamiento de valores nulos:")
    biometric_cols = ["horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"]
    for col in biometric_cols:
        n_nulls = df[col].isnull().sum()
        if n_nulls > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            log.append(f"  {col}: {n_nulls} nulos imputados con mediana ({median_val})")
            print(f"    {col}: {n_nulls} nulos -> imputados con mediana ({median_val:.1f})")

    # ── 2.3 Corrección de tipos ──
    print(f"  [2.3] Corrección de tipos de datos:")

    # Asegurar tipos enteros después de imputación
    df["pasos_diarios"] = df["pasos_diarios"].astype(int)
    log.append("pasos_diarios: convertido a int post-imputación")

    # Asegurar que nivel_estres es categórico ordinal internamente
    df["nivel_estres"] = df["nivel_estres"].astype(int)
    log.append("nivel_estres: verificado como int")
    print(f"    pasos_diarios -> int, nivel_estres -> int")

    # ── 2.4 Validación de rangos ──
    print(f"  [2.4] Validación de rangos:")
    range_rules = {
        "edad": (16, 65),
        "dias_activo": (0, 180),
        "tasa_adherencia": (0.0, 1.0),
        "friccion_promedio": (1.0, 10.0),
        "racha_maxima": (0, 180),
        "frecuencia_fallo_semanal": (0.0, 7.0),
        "tendencia_crecimiento": (-1.0, 1.0),
        "horas_sueno": (3.0, 10.0),
        "pasos_diarios": (0, 35000),
        "fc_media": (40, 120),
        "spo2_promedio": (85, 100),
        "nivel_estres": (1, 5),
    }

    out_of_range_total = 0
    for col, (min_val, max_val) in range_rules.items():
        out_of_range = ((df[col] < min_val) | (df[col] > max_val)).sum()
        if out_of_range > 0:
            df[col] = df[col].clip(min_val, max_val)
            out_of_range_total += out_of_range
            log.append(f"  {col}: {out_of_range} valores fuera de rango clipeados a [{min_val}, {max_val}]")
            print(f"    {col}: {out_of_range} valores clipeados a [{min_val}, {max_val}]")

    if out_of_range_total == 0:
        print(f"    Todos los valores dentro de rangos esperados")

    # ── 2.5 Codificación de variables categóricas ──
    print(f"  [2.5] Codificación de variables categóricas:")

    # Codificación One-Hot para género
    genero_dummies = pd.get_dummies(df["genero"], prefix="genero", dtype=int)
    df = pd.concat([df, genero_dummies], axis=1)
    log.append(f"genero: One-Hot encoding -> {list(genero_dummies.columns)}")
    print(f"    genero -> One-Hot: {list(genero_dummies.columns)}")

    # Codificación One-Hot para dispositivo
    dispositivo_dummies = pd.get_dummies(df["dispositivo"], prefix="disp", dtype=int)
    df = pd.concat([df, dispositivo_dummies], axis=1)
    log.append(f"dispositivo: One-Hot encoding -> {list(dispositivo_dummies.columns)}")
    print(f"    dispositivo -> One-Hot: {list(dispositivo_dummies.columns)}")

    # Codificación ordinal para riesgo_abandono
    riesgo_map = {"Bajo": 0, "Medio": 1, "Alto": 2}
    df["riesgo_abandono_cod"] = df["riesgo_abandono"].map(riesgo_map)
    log.append(f"riesgo_abandono: Codificación ordinal -> {riesgo_map}")
    print(f"    riesgo_abandono -> Ordinal: {riesgo_map}")

    # ── 2.6 Ingeniería de características (Feature Engineering) ──
    print(f"  [2.6] Ingeniería de características:")

    # Índice de riesgo compuesto (feature derivado)
    df["indice_riesgo_compuesto"] = (
        (1 - df["tasa_adherencia"]) * 0.35 +
        (df["friccion_promedio"] / 10.0) * 0.25 +
        (df["frecuencia_fallo_semanal"] / 7.0) * 0.20 +
        (df["nivel_estres"] / 5.0) * 0.20
    ).round(4)
    log.append("indice_riesgo_compuesto: Feature derivado (ponderación adherencia/fricción/fallo/estrés)")
    print(f"    + indice_riesgo_compuesto (ponderado)")

    # Ratio adherencia/fricción
    df["ratio_adherencia_friccion"] = (
        df["tasa_adherencia"] / df["friccion_promedio"].replace(0, 0.01)
    ).round(4)
    log.append("ratio_adherencia_friccion: Feature derivado (adherencia / fricción)")
    print(f"    + ratio_adherencia_friccion")

    # Grupo de edad categórico
    df["grupo_edad"] = pd.cut(
        df["edad"],
        bins=[0, 24, 40, 100],
        labels=["Joven", "Adulto", "Senior"]
    ).astype(str)
    log.append("grupo_edad: Feature derivado de edad (Joven: 16-24, Adulto: 25-40, Senior: 41+)")
    print(f"    + grupo_edad (Joven/Adulto/Senior)")

    # Eficiencia de racha (racha_maxima / dias_activo)
    df["eficiencia_racha"] = np.where(
        df["dias_activo"] > 0,
        (df["racha_maxima"] / df["dias_activo"]).round(4),
        0.0
    )
    log.append("eficiencia_racha: Feature derivado (racha_maxima / dias_activo)")
    print(f"    + eficiencia_racha")

    # ── 2.7 Reporte de bitácora ──
    print(f"\n  Bitácora de transformaciones ({len(log)} operaciones):")
    for i, entry in enumerate(log, 1):
        print(f"    {i}. {entry}")

    return df, log


# ============================================================================
# 3. CARGA
# ============================================================================

def load(df: pd.DataFrame, filepath: Path):
    """
    Carga los datos procesados en el directorio de salida.
    """
    print("\n" + "=" * 70)
    print("FASE 3: CARGA")
    print("=" * 70)

    filepath.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(filepath, index=False, encoding="utf-8")

    print(f"  Destino: {filepath}")
    print(f"  Registros cargados: {len(df)}")
    print(f"  Columnas finales: {len(df.columns)}")
    print(f"  Nuevas columnas (vs raw): "
          f"{len(df.columns) - 16}")  # 16 columnas originales
    print(f"  Tamaño del archivo: {filepath.stat().st_size / 1024:.1f} KB")


# ============================================================================
# 4. VALIDACIÓN POST-CARGA
# ============================================================================

def validate(df_original: pd.DataFrame, df_processed: pd.DataFrame):
    """
    Verifica la integridad del proceso ETL comparando datos antes y después.
    """
    print("\n" + "=" * 70)
    print("FASE 4: VALIDACIÓN")
    print("=" * 70)

    checks = []

    # Check 1: Sin pérdida de registros
    original_count = len(df_original)
    processed_count = len(df_processed)
    duplicates_removed = df_original.duplicated(subset=["usuario_id"]).sum()
    expected = original_count - duplicates_removed
    passed = processed_count == expected
    checks.append(("Sin pérdida de registros", passed,
                    f"{processed_count}/{expected} esperados"))

    # Check 2: Sin valores nulos en features principales
    critical_cols = ["tasa_adherencia", "friccion_promedio", "nivel_estres",
                     "horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"]
    nulls_remaining = df_processed[critical_cols].isnull().sum().sum()
    passed = nulls_remaining == 0
    checks.append(("Sin nulos en features críticas", passed,
                    f"{nulls_remaining} nulos restantes"))

    # Check 3: Todos los rangos dentro de límites
    range_ok = (
        (df_processed["tasa_adherencia"] >= 0).all() and
        (df_processed["tasa_adherencia"] <= 1).all() and
        (df_processed["friccion_promedio"] >= 1).all() and
        (df_processed["friccion_promedio"] <= 10).all() and
        (df_processed["nivel_estres"] >= 1).all() and
        (df_processed["nivel_estres"] <= 5).all()
    )
    checks.append(("Rangos dentro de límites", range_ok, ""))

    # Check 4: Codificaciones correctas
    has_onehot = all(col in df_processed.columns for col in
                     ["genero_Masculino", "genero_Femenino", "riesgo_abandono_cod"])
    checks.append(("Codificaciones One-Hot presentes", has_onehot, ""))

    # Check 5: Features derivados existen
    has_features = all(col in df_processed.columns for col in
                       ["indice_riesgo_compuesto", "ratio_adherencia_friccion",
                        "grupo_edad", "eficiencia_racha"])
    checks.append(("Features derivados generados", has_features, ""))

    # Check 6: Tipos correctos
    types_ok = (
        df_processed["pasos_diarios"].dtype in ["int64", "int32"] and
        df_processed["nivel_estres"].dtype in ["int64", "int32"]
    )
    checks.append(("Tipos de datos correctos", types_ok, ""))

    # Mostrar resultados
    all_passed = True
    for name, passed, detail in checks:
        status = "PASS" if passed else "FAIL"
        icon = "[OK]" if passed else "[!!]"
        detail_str = f" ({detail})" if detail else ""
        print(f"  {icon} {name}: {status}{detail_str}")
        if not passed:
            all_passed = False

    print(f"\n  Resultado: {'TODAS LAS VALIDACIONES PASARON' if all_passed else 'HAY VALIDACIONES FALLIDAS'}")

    # Resumen de datos antes vs después
    print(f"\n  Comparación antes/después:")
    print(f"    Registros: {len(df_original)} -> {len(df_processed)}")
    print(f"    Columnas:  {len(df_original.columns)} -> {len(df_processed.columns)}")
    print(f"    Nulos:     {df_original.isnull().sum().sum()} -> {df_processed.isnull().sum().sum()}")

    return all_passed


# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

def main():
    print("=" * 70)
    print("QUANTIFY -- Pipeline ETL Reproducible (Etapa 7)")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # Extracción
    df_raw = extract(INPUT_FILE)

    # Transformación
    df_clean, bitacora = transform(df_raw)

    # Carga
    load(df_clean, OUTPUT_FILE)

    # Validación
    validate(df_raw, df_clean)

    print("\n" + "=" * 70)
    print("Pipeline ETL completado exitosamente.")
    print("=" * 70)

    return df_clean


if __name__ == "__main__":
    main()
