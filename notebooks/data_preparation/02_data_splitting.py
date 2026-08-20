"""
==============================================================================
QUANTIFY — Preparación y Particionado de Conjuntos de Datos
==============================================================================

Etapa 9 del Proyecto Integrador.
Metodología CRISP-DM: Fase 3 — Preparación de los Datos (División).

Genera:
  data/training/       (70%)
  data/validation/     (15%)
  data/test/           (15%)
  data/inference/      (casos nuevos sin etiqueta)
  models/serialized/scaler.pkl

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

SEED = 2026
np.random.seed(SEED)

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_FILE = DATA_DIR / "processed" / "quantify_clean.csv"
TRAIN_DIR = DATA_DIR / "training"
VAL_DIR = DATA_DIR / "validation"
TEST_DIR = DATA_DIR / "test"
INFERENCE_DIR = DATA_DIR / "inference"
MODELS_DIR = BASE_DIR / "models" / "serialized"

# Crear directorios
for d in [TRAIN_DIR, VAL_DIR, TEST_DIR, INFERENCE_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


# ============================================================================
# FEATURES Y VARIABLE OBJETIVO
# ============================================================================

# Features numéricos seleccionados para modelado
NUMERIC_FEATURES = [
    "edad",
    "dias_activo",
    "tasa_adherencia",
    "friccion_promedio",
    "racha_maxima",
    "frecuencia_fallo_semanal",
    "tendencia_crecimiento",
    "horas_sueno",
    "pasos_diarios",
    "fc_media",
    "spo2_promedio",
    "nivel_estres",
    "indice_riesgo_compuesto",
    "ratio_adherencia_friccion",
    "eficiencia_racha",
]

# Features categóricos (ya codificados como One-Hot en ETL)
CATEGORICAL_FEATURES = [
    "genero_Femenino",
    "genero_Masculino",
    "genero_No Binario",
    "disp_Smartwatch",
    "disp_Web",
    "disp_Web+Smartwatch",
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Variable objetivo
TARGET = "riesgo_abandono"
TARGET_COD = "riesgo_abandono_cod"


def main():
    print("=" * 70)
    print("QUANTIFY -- Preparacion de Conjuntos de Datos (Etapa 9)")
    print("=" * 70)

    # ── Cargar datos procesados ──
    df = pd.read_csv(PROCESSED_FILE)
    print(f"\nDataset cargado: {len(df)} registros, {len(df.columns)} columnas")

    # ── Seleccionar features y objetivo ──
    X = df[ALL_FEATURES].copy()
    y = df[TARGET].copy()
    y_cod = df[TARGET_COD].copy()

    print(f"\nFeatures seleccionados: {len(ALL_FEATURES)}")
    print(f"  Numericos: {len(NUMERIC_FEATURES)}")
    print(f"  Categoricos (One-Hot): {len(CATEGORICAL_FEATURES)}")
    print(f"Variable objetivo: {TARGET}")
    print(f"  Distribucion: {dict(y.value_counts())}")

    # ==================================================================
    # 1. DIVISIÓN ESTRATIFICADA (70/15/15)
    # ==================================================================
    print("\n" + "=" * 70)
    print("1. DIVISION ESTRATIFICADA")
    print("=" * 70)

    # Primera división: 70% train, 30% temp
    X_train, X_temp, y_train, y_temp, y_train_cod, y_temp_cod = train_test_split(
        X, y, y_cod,
        test_size=0.30,
        random_state=SEED,
        stratify=y
    )

    # Segunda división: 50/50 del 30% → 15% validation, 15% test
    X_val, X_test, y_val, y_test, y_val_cod, y_test_cod = train_test_split(
        X_temp, y_temp, y_temp_cod,
        test_size=0.50,
        random_state=SEED,
        stratify=y_temp
    )

    print(f"\n  Division realizada (semilla: {SEED}):")
    print(f"    Training:   {len(X_train)} ({len(X_train)/len(X)*100:.1f}%)")
    print(f"    Validation: {len(X_val)} ({len(X_val)/len(X)*100:.1f}%)")
    print(f"    Test:       {len(X_test)} ({len(X_test)/len(X)*100:.1f}%)")

    # Verificar estratificación
    print(f"\n  Verificacion de estratificacion:")
    for label in ["Bajo", "Medio", "Alto"]:
        pct_orig = (y == label).mean() * 100
        pct_train = (y_train == label).mean() * 100
        pct_val = (y_val == label).mean() * 100
        pct_test = (y_test == label).mean() * 100
        print(f"    {label}: Original={pct_orig:.1f}% | Train={pct_train:.1f}% | Val={pct_val:.1f}% | Test={pct_test:.1f}%")

    # ==================================================================
    # 2. ESCALADO (SOLO CON ESTADÍSTICAS DE TRAIN)
    # ==================================================================
    print("\n" + "=" * 70)
    print("2. ESCALADO (PREVENCION DE DATA LEAKAGE)")
    print("=" * 70)

    scaler = StandardScaler()

    # Fit SOLO con training
    X_train_scaled = X_train.copy()
    X_train_scaled[NUMERIC_FEATURES] = scaler.fit_transform(X_train[NUMERIC_FEATURES])
    print(f"\n  StandardScaler ajustado con {len(X_train)} registros de training")

    # Transform validation y test con las mismas estadísticas
    X_val_scaled = X_val.copy()
    X_val_scaled[NUMERIC_FEATURES] = scaler.transform(X_val[NUMERIC_FEATURES])

    X_test_scaled = X_test.copy()
    X_test_scaled[NUMERIC_FEATURES] = scaler.transform(X_test[NUMERIC_FEATURES])

    print(f"  Validation y Test transformados con estadisticas de Training (sin fuga)")

    # Verificar que no hay fuga
    print(f"\n  Verificacion de prevencion de fuga:")
    print(f"    Media de training escalado (debe ser ~0):")
    train_means = X_train_scaled[NUMERIC_FEATURES].mean()
    for col in NUMERIC_FEATURES[:5]:
        print(f"      {col}: {train_means[col]:.6f}")
    print(f"      ... (todas ~0)")

    # ==================================================================
    # 3. GENERACIÓN DE CONJUNTO DE INFERENCIA
    # ==================================================================
    print("\n" + "=" * 70)
    print("3. GENERACION DE CONJUNTO DE INFERENCIA")
    print("=" * 70)

    # Crear 50 casos nuevos sin etiqueta para demostrar inferencia
    np.random.seed(SEED + 1)  # Semilla diferente para datos nuevos
    n_inference = 50

    inference_data = pd.DataFrame({
        "edad": np.random.randint(18, 55, n_inference),
        "dias_activo": np.random.randint(5, 120, n_inference),
        "tasa_adherencia": np.random.uniform(0.10, 0.95, n_inference).round(4),
        "friccion_promedio": np.random.uniform(2.0, 9.0, n_inference).round(2),
        "racha_maxima": np.random.randint(1, 60, n_inference),
        "frecuencia_fallo_semanal": np.random.uniform(0.5, 5.5, n_inference).round(1),
        "tendencia_crecimiento": np.random.uniform(-0.8, 0.7, n_inference).round(3),
        "horas_sueno": np.random.uniform(4.0, 9.0, n_inference).round(1),
        "pasos_diarios": np.random.randint(1000, 20000, n_inference),
        "fc_media": np.random.uniform(55, 100, n_inference).round(1),
        "spo2_promedio": np.random.uniform(92, 99, n_inference).round(1),
        "nivel_estres": np.random.randint(1, 6, n_inference),
    })

    # Features derivados
    inference_data["indice_riesgo_compuesto"] = (
        (1 - inference_data["tasa_adherencia"]) * 0.35 +
        (inference_data["friccion_promedio"] / 10.0) * 0.25 +
        (inference_data["frecuencia_fallo_semanal"] / 7.0) * 0.20 +
        (inference_data["nivel_estres"] / 5.0) * 0.20
    ).round(4)

    inference_data["ratio_adherencia_friccion"] = (
        inference_data["tasa_adherencia"] / inference_data["friccion_promedio"]
    ).round(4)

    inference_data["eficiencia_racha"] = np.where(
        inference_data["dias_activo"] > 0,
        (inference_data["racha_maxima"] / inference_data["dias_activo"]).round(4),
        0.0
    )

    # One-Hot categóricos (valores aleatorios)
    for col in CATEGORICAL_FEATURES:
        inference_data[col] = 0
    # Asignar género y dispositivo aleatorios
    for i in range(n_inference):
        g = np.random.choice(["genero_Femenino", "genero_Masculino", "genero_No Binario"])
        d = np.random.choice(["disp_Smartwatch", "disp_Web", "disp_Web+Smartwatch"])
        inference_data.loc[i, g] = 1
        inference_data.loc[i, d] = 1

    # Escalar con el mismo scaler
    inference_scaled = inference_data.copy()
    inference_scaled[NUMERIC_FEATURES] = scaler.transform(inference_data[NUMERIC_FEATURES])

    print(f"  Generados {n_inference} casos nuevos para inferencia (sin etiqueta)")
    print(f"  Escalados con el mismo StandardScaler de training")

    # ==================================================================
    # 4. GUARDADO DE ARCHIVOS
    # ==================================================================
    print("\n" + "=" * 70)
    print("4. GUARDADO DE ARCHIVOS")
    print("=" * 70)

    # Training
    train_df = X_train_scaled.copy()
    train_df[TARGET] = y_train.values
    train_df[TARGET_COD] = y_train_cod.values
    train_df.to_csv(TRAIN_DIR / "train.csv", index=False)
    print(f"  data/training/train.csv: {len(train_df)} registros")

    # Validation
    val_df = X_val_scaled.copy()
    val_df[TARGET] = y_val.values
    val_df[TARGET_COD] = y_val_cod.values
    val_df.to_csv(VAL_DIR / "validation.csv", index=False)
    print(f"  data/validation/validation.csv: {len(val_df)} registros")

    # Test
    test_df = X_test_scaled.copy()
    test_df[TARGET] = y_test.values
    test_df[TARGET_COD] = y_test_cod.values
    test_df.to_csv(TEST_DIR / "test.csv", index=False)
    print(f"  data/test/test.csv: {len(test_df)} registros")

    # Inference
    inference_scaled.to_csv(INFERENCE_DIR / "inference.csv", index=False)
    print(f"  data/inference/inference.csv: {n_inference} registros (sin etiqueta)")

    # Scaler
    scaler_path = MODELS_DIR / "scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"  models/serialized/scaler.pkl: StandardScaler serializado")

    # Feature list
    feature_info = {
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "all_features": ALL_FEATURES,
        "target": TARGET,
        "target_coded": TARGET_COD,
        "seed": SEED,
        "split_ratio": "70/15/15",
    }
    pd.DataFrame([feature_info]).to_json(MODELS_DIR / "feature_config.json", orient="records", indent=2)
    print(f"  models/serialized/feature_config.json: Configuracion de features")

    # ==================================================================
    # RESUMEN FINAL
    # ==================================================================
    print("\n" + "=" * 70)
    print("RESUMEN FINAL")
    print("=" * 70)
    print(f"""
  Estructura generada:
    data/
    |-- training/train.csv        ({len(train_df)} registros, {len(train_df.columns)} cols)
    |-- validation/validation.csv ({len(val_df)} registros, {len(val_df.columns)} cols)
    |-- test/test.csv             ({len(test_df)} registros, {len(test_df.columns)} cols)
    |-- inference/inference.csv   ({n_inference} registros, sin etiqueta)
    models/
    |-- serialized/scaler.pkl
    |-- serialized/feature_config.json

  Semilla utilizada: {SEED}
  Estratificacion: Verificada (proporciones iguales en train/val/test)
  Prevencion de fuga: Scaler ajustado solo con training
    """)


if __name__ == "__main__":
    main()
