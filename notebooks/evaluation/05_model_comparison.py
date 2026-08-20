"""
==============================================================================
QUANTIFY — Evaluación, Comparación y Selección de Modelos
==============================================================================

Etapa 12 del Proyecto Integrador.
Metodología CRISP-DM: Fase 5 — Evaluación.

Este script carga los modelos entrenados y los datos de test/inferencia,
evalúa métricas finales, analiza tiempos de inferencia y selecciona
el modelo óptimo para despliegue.

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import numpy as np
import pandas as pd
import joblib
import json
import time
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import accuracy_score, f1_score, classification_report

SEED = 2026
np.random.seed(SEED)

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEST_FILE = BASE_DIR / "data" / "test" / "test.csv"
INFERENCE_FILE = BASE_DIR / "data" / "inference" / "inference.csv"
MODELS_DIR = BASE_DIR / "models" / "serialized"
FIG_DIR = BASE_DIR / "notebooks" / "evaluation" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# Feature config
with open(MODELS_DIR / "feature_config.json", "r") as f:
    config = json.load(f)[0]

ALL_FEATURES = config["all_features"]
NUMERIC_FEATURES = config["numeric_features"]
TARGET = config["target"]
LABELS = ["Bajo", "Medio", "Alto"]


def measure_inference_time(model, X, n_runs=10):
    """Mide el tiempo promedio de inferencia por registro (en milisegundos)."""
    times = []
    for _ in range(n_runs):
        start = time.perf_counter()
        _ = model.predict(X)
        end = time.perf_counter()
        times.append(end - start)
    
    avg_time_ms = (np.mean(times) / len(X)) * 1000
    return avg_time_ms


def main():
    print("=" * 70)
    print("QUANTIFY -- Evaluacion y Seleccion de Modelos (Etapa 12)")
    print("=" * 70)

    # 1. Cargar Datos
    print("\n[1] Cargando datos y modelos...")
    test_df = pd.read_csv(TEST_FILE)
    inference_df = pd.read_csv(INFERENCE_FILE)

    X_test = test_df[ALL_FEATURES]
    y_test = test_df[TARGET]
    X_inference = inference_df[ALL_FEATURES]
    X_inference_num = inference_df[NUMERIC_FEATURES]

    print(f"  Test data: {len(X_test)} registros")
    print(f"  Inference data: {len(X_inference)} registros")

    # 2. Cargar Modelos y Métricas
    try:
        supervised_metrics = pd.read_csv(MODELS_DIR / "supervised_metrics.csv")
        rf_model = joblib.load(MODELS_DIR / "burnout_classifier.pkl")
        kmeans_model = joblib.load(MODELS_DIR / "kmeans_archetypes.pkl")
        with open(MODELS_DIR / "unsupervised_metadata.json", "r") as f:
            unsupervised_meta = json.load(f)
    except Exception as e:
        print(f"Error cargando modelos: {e}")
        return

    print("  Modelos cargados exitosamente.")

    # 3. Evaluación Comparativa (Supervisado)
    print("\n" + "=" * 70)
    print("[2] Analisis de Modelos Supervisados")
    print("=" * 70)
    
    print("\n  Metricas en Validacion (Todos los modelos):")
    print(supervised_metrics[['model', 'accuracy_val', 'f1_weighted_val', 'roc_auc_val']].to_string(index=False))

    # Test vs Train para ver Overfitting en el modelo final
    best_model_name = "RF Optimizado"
    best_row = supervised_metrics[supervised_metrics["model"] == best_model_name].iloc[0]
    
    y_pred_test = rf_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred_test)
    test_f1 = f1_score(y_test, y_pred_test, average="weighted")
    
    train_acc = best_row["accuracy_train"]
    val_acc = best_row["accuracy_val"]
    
    print(f"\n  Analisis de Sobreajuste ({best_model_name}):")
    print(f"    Train Accuracy: {train_acc:.4f}")
    print(f"    Val Accuracy:   {val_acc:.4f} (Caida: {(train_acc - val_acc)*100:.2f}%)")
    print(f"    Test Accuracy:  {test_acc:.4f} (Brecha Val-Test: {(val_acc - test_acc)*100:.2f}%)")
    
    if train_acc - test_acc < 0.05:
        print("    Conclusion: Excelente generalizacion, no hay sobreajuste significativo.")
    else:
        print("    Conclusion: Posible sobreajuste detectado.")

    # Tiempos de Inferencia
    print("\n  Analisis de Tiempos de Inferencia:")
    rf_time = measure_inference_time(rf_model, X_inference)
    print(f"    {best_model_name}: {rf_time:.4f} ms por registro")
    
    if rf_time < 10.0:
        print("    Conclusion: Tiempo de inferencia apto para procesamiento en tiempo real via API.")
    else:
        print("    Conclusion: Inferencia lenta, requiere procesamiento por lotes (batch).")

    # Gráfica Train vs Val vs Test
    fig, ax = plt.subplots(figsize=(8, 5))
    stages = ["Train", "Validation", "Test"]
    scores = [train_acc, val_acc, test_acc]
    ax.plot(stages, scores, marker='o', linewidth=2, markersize=8, color='#2ecc71')
    for i, txt in enumerate(scores):
        ax.annotate(f"{txt:.4f}", (stages[i], scores[i] + 0.002), fontweight='bold')
    ax.set_ylim(0.9, 1.01)
    ax.set_ylabel("Accuracy")
    ax.set_title(f"Generalizacion del Modelo: {best_model_name}", fontweight='bold')
    ax.grid(True, alpha=0.3)
    plt.savefig(FIG_DIR / "01_generalizacion.png", dpi=150, bbox_inches='tight')
    plt.close()

    # 4. Evaluación No Supervisado
    print("\n" + "=" * 70)
    print("[3] Analisis de Modelo No Supervisado (K-Means)")
    print("=" * 70)
    
    print(f"  Silhouette Score: {unsupervised_meta['silhouette_score']:.4f}")
    print(f"  Davies-Bouldin: {unsupervised_meta['davies_bouldin_score']:.4f}")
    
    if unsupervised_meta['silhouette_score'] > 0:
        print("  Conclusion: Clusters separables detectados.")
    else:
        print("  Conclusion: Clusters altamente superpuestos.")

    # 5. Demostración Conjunta en Datos de Inferencia Nuevos
    print("\n" + "=" * 70)
    print("[4] Demostracion Conjunta (Simulacion de Produccion)")
    print("=" * 70)
    
    print(f"  Aplicando pipeline a {len(X_inference)} registros nuevos sin etiqueta...")
    
    # Predecir riesgo (Supervisado)
    inf_riesgo = rf_model.predict(X_inference)
    inf_proba = rf_model.predict_proba(X_inference)
    proba_max = np.max(inf_proba, axis=1)
    
    # Asignar cluster (No Supervisado)
    inf_clusters = kmeans_model.predict(X_inference_num)
    
    # Resultados
    results_df = pd.DataFrame({
        "Riesgo_Predicho": inf_riesgo,
        "Confianza": proba_max,
        "Cluster_Asignado": inf_clusters
    })
    
    print("\n  Ejemplo de Inferencia (Top 5 registros):")
    print(results_df.head().to_string())
    
    # Cruce de Arquetipo vs Riesgo Predicho
    print("\n  Matriz de Cruce (Cluster vs Riesgo Predicho):")
    crosstab = pd.crosstab(results_df["Cluster_Asignado"], results_df["Riesgo_Predicho"])
    cluster_names = unsupervised_meta["cluster_names"]
    crosstab.index = [f"C{i}: {cluster_names[str(i)]}" for i in crosstab.index]
    print(crosstab)
    
    print("\n  Nota: Si el clustering y la clasificacion tienen alta congruencia,")
    print("  el sistema es robusto. Por ejemplo, el cluster 'En Riesgo de Abandono'")
    print("  deberia coincidir casi siempre con la prediccion de riesgo 'Alto'.")

    print("\n" + "=" * 70)
    print("Evaluacion completada exitosamente.")
    print("=" * 70)


if __name__ == "__main__":
    main()
