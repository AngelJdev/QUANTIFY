"""
==============================================================================
QUANTIFY — Modelos Supervisados (Clasificación de Riesgo de Abandono)
==============================================================================

Etapa 10 del Proyecto Integrador.
Metodología CRISP-DM: Fase 4 — Modelado.

Algoritmos: Random Forest, Regresión Logística, SVM
Variable objetivo: riesgo_abandono (Bajo, Medio, Alto)
Métricas: Accuracy, Precision, Recall, F1-Score, Confusion Matrix, ROC-AUC

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import numpy as np
import pandas as pd
import joblib
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.preprocessing import label_binarize

SEED = 2026
np.random.seed(SEED)

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
TRAIN_FILE = BASE_DIR / "data" / "training" / "train.csv"
VAL_FILE = BASE_DIR / "data" / "validation" / "validation.csv"
TEST_FILE = BASE_DIR / "data" / "test" / "test.csv"
MODELS_DIR = BASE_DIR / "models" / "serialized"
FIG_DIR = BASE_DIR / "notebooks" / "supervised" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# Feature config
with open(MODELS_DIR / "feature_config.json", "r") as f:
    config = json.load(f)[0]

ALL_FEATURES = config["all_features"]
TARGET = config["target"]
TARGET_COD = config["target_coded"]
LABELS = ["Bajo", "Medio", "Alto"]


def load_data():
    """Carga los conjuntos de datos particionados."""
    train = pd.read_csv(TRAIN_FILE)
    val = pd.read_csv(VAL_FILE)
    test = pd.read_csv(TEST_FILE)

    X_train = train[ALL_FEATURES]
    y_train = train[TARGET]

    X_val = val[ALL_FEATURES]
    y_val = val[TARGET]

    X_test = test[ALL_FEATURES]
    y_test = test[TARGET]

    return X_train, y_train, X_val, y_val, X_test, y_test


def evaluate_model(name, model, X_train, y_train, X_val, y_val):
    """Evalúa un modelo con múltiples métricas."""
    y_pred_train = model.predict(X_train)
    y_pred_val = model.predict(X_val)

    metrics = {
        "model": name,
        "accuracy_train": accuracy_score(y_train, y_pred_train),
        "accuracy_val": accuracy_score(y_val, y_pred_val),
        "precision_val": precision_score(y_val, y_pred_val, average="weighted", zero_division=0),
        "recall_val": recall_score(y_val, y_pred_val, average="weighted", zero_division=0),
        "f1_weighted_val": f1_score(y_val, y_pred_val, average="weighted", zero_division=0),
        "f1_macro_val": f1_score(y_val, y_pred_val, average="macro", zero_division=0),
    }

    # ROC-AUC (one-vs-rest)
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_val)
        y_val_bin = label_binarize(y_val, classes=LABELS)
        try:
            metrics["roc_auc_val"] = roc_auc_score(y_val_bin, y_proba, multi_class="ovr", average="weighted")
        except ValueError:
            metrics["roc_auc_val"] = None
    else:
        metrics["roc_auc_val"] = None

    return metrics, y_pred_val


def plot_confusion_matrix(y_true, y_pred, model_name, filepath):
    """Genera y guarda la matriz de confusión."""
    cm = confusion_matrix(y_true, y_pred, labels=LABELS)
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=LABELS, yticklabels=LABELS, ax=ax,
                linewidths=1, linecolor='white')
    ax.set_title(f"Matriz de Confusion: {model_name}", fontweight='bold')
    ax.set_ylabel("Real")
    ax.set_xlabel("Prediccion")
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()


def plot_feature_importance(model, feature_names, filepath):
    """Gráfica de importancia de features (para Random Forest)."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:15]

    fig, ax = plt.subplots(figsize=(12, 6))
    colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(indices)))
    bars = ax.barh(range(len(indices)), importances[indices][::-1],
                   color=colors[::-1], edgecolor='white')
    ax.set_yticks(range(len(indices)))
    ax.set_yticklabels([feature_names[i] for i in indices][::-1])
    ax.set_xlabel("Importancia")
    ax.set_title("Top 15 Features (Random Forest)", fontweight='bold')

    for bar, val in zip(bars, importances[indices][::-1]):
        ax.text(bar.get_width() + 0.003, bar.get_y() + bar.get_height()/2,
                f'{val:.3f}', va='center', fontsize=9)

    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()


def main():
    print("=" * 70)
    print("QUANTIFY -- Modelos Supervisados (Etapa 10)")
    print("=" * 70)

    X_train, y_train, X_val, y_val, X_test, y_test = load_data()
    print(f"\nTraining: {len(X_train)} | Validation: {len(X_val)} | Test: {len(X_test)}")

    results = []

    # ==================================================================
    # MODELO 1: Random Forest
    # ==================================================================
    print("\n" + "=" * 70)
    print("MODELO 1: Random Forest")
    print("=" * 70)

    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=SEED,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    metrics_rf, y_pred_rf = evaluate_model("Random Forest", rf, X_train, y_train, X_val, y_val)
    results.append(metrics_rf)

    print(f"\n  Accuracy (train): {metrics_rf['accuracy_train']:.4f}")
    print(f"  Accuracy (val):   {metrics_rf['accuracy_val']:.4f}")
    print(f"  F1 Weighted:      {metrics_rf['f1_weighted_val']:.4f}")
    print(f"  F1 Macro:         {metrics_rf['f1_macro_val']:.4f}")
    print(f"  ROC-AUC:          {metrics_rf['roc_auc_val']:.4f}")

    print(f"\n  Classification Report:")
    print(classification_report(y_val, y_pred_rf, target_names=LABELS))

    plot_confusion_matrix(y_val, y_pred_rf, "Random Forest",
                          FIG_DIR / "01_confusion_random_forest.png")
    plot_feature_importance(rf, ALL_FEATURES,
                            FIG_DIR / "02_feature_importance_rf.png")

    # ==================================================================
    # MODELO 2: Regresión Logística
    # ==================================================================
    print("=" * 70)
    print("MODELO 2: Regresion Logistica")
    print("=" * 70)

    lr = LogisticRegression(
        max_iter=1000,
        solver="lbfgs",
        random_state=SEED,
        C=1.0
    )
    lr.fit(X_train, y_train)

    metrics_lr, y_pred_lr = evaluate_model("Logistic Regression", lr, X_train, y_train, X_val, y_val)
    results.append(metrics_lr)

    print(f"\n  Accuracy (train): {metrics_lr['accuracy_train']:.4f}")
    print(f"  Accuracy (val):   {metrics_lr['accuracy_val']:.4f}")
    print(f"  F1 Weighted:      {metrics_lr['f1_weighted_val']:.4f}")
    print(f"  F1 Macro:         {metrics_lr['f1_macro_val']:.4f}")
    print(f"  ROC-AUC:          {metrics_lr['roc_auc_val']:.4f}")

    print(f"\n  Classification Report:")
    print(classification_report(y_val, y_pred_lr, target_names=LABELS))

    plot_confusion_matrix(y_val, y_pred_lr, "Logistic Regression",
                          FIG_DIR / "03_confusion_logistic_regression.png")

    # ==================================================================
    # MODELO 3: SVM (Support Vector Machine)
    # ==================================================================
    print("=" * 70)
    print("MODELO 3: SVM (Support Vector Machine)")
    print("=" * 70)

    svm = SVC(
        kernel="rbf",
        C=10.0,
        gamma="scale",
        random_state=SEED,
        probability=True
    )
    svm.fit(X_train, y_train)

    metrics_svm, y_pred_svm = evaluate_model("SVM (RBF)", svm, X_train, y_train, X_val, y_val)
    results.append(metrics_svm)

    print(f"\n  Accuracy (train): {metrics_svm['accuracy_train']:.4f}")
    print(f"  Accuracy (val):   {metrics_svm['accuracy_val']:.4f}")
    print(f"  F1 Weighted:      {metrics_svm['f1_weighted_val']:.4f}")
    print(f"  F1 Macro:         {metrics_svm['f1_macro_val']:.4f}")
    print(f"  ROC-AUC:          {metrics_svm['roc_auc_val']:.4f}")

    print(f"\n  Classification Report:")
    print(classification_report(y_val, y_pred_svm, target_names=LABELS))

    plot_confusion_matrix(y_val, y_pred_svm, "SVM (RBF)",
                          FIG_DIR / "04_confusion_svm.png")

    # ==================================================================
    # OPTIMIZACIÓN DE HIPERPARÁMETROS (Random Forest)
    # ==================================================================
    print("=" * 70)
    print("OPTIMIZACION DE HIPERPARAMETROS (Random Forest)")
    print("=" * 70)

    param_grid = {
        "n_estimators": [100, 200, 300],
        "max_depth": [10, 15, 20],
        "min_samples_split": [2, 5],
    }

    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=SEED, n_jobs=-1),
        param_grid,
        cv=5,
        scoring="f1_weighted",
        n_jobs=-1,
        verbose=0
    )
    grid_search.fit(X_train, y_train)

    print(f"\n  Mejores hiperparametros: {grid_search.best_params_}")
    print(f"  Mejor F1 Weighted (CV): {grid_search.best_score_:.4f}")

    best_rf = grid_search.best_estimator_
    metrics_best, y_pred_best = evaluate_model("RF Optimizado", best_rf, X_train, y_train, X_val, y_val)
    results.append(metrics_best)

    print(f"  Accuracy (val):   {metrics_best['accuracy_val']:.4f}")
    print(f"  F1 Weighted:      {metrics_best['f1_weighted_val']:.4f}")

    plot_confusion_matrix(y_val, y_pred_best, "RF Optimizado",
                          FIG_DIR / "05_confusion_rf_optimizado.png")

    # ==================================================================
    # CROSS-VALIDATION DEL MEJOR MODELO
    # ==================================================================
    print("\n" + "=" * 70)
    print("CROSS-VALIDATION (5-Fold) — RF Optimizado")
    print("=" * 70)

    cv_scores = cross_val_score(best_rf, X_train, y_train, cv=5, scoring="f1_weighted", n_jobs=-1)
    print(f"\n  Scores por fold: {[f'{s:.4f}' for s in cv_scores]}")
    print(f"  Media: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # ==================================================================
    # EVALUACIÓN EN TEST (SOLO MODELO FINAL)
    # ==================================================================
    print("\n" + "=" * 70)
    print("EVALUACION FINAL EN CONJUNTO DE TEST")
    print("=" * 70)

    y_pred_test = best_rf.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred_test)
    test_f1 = f1_score(y_test, y_pred_test, average="weighted")
    test_f1_macro = f1_score(y_test, y_pred_test, average="macro")

    print(f"\n  Accuracy (test):  {test_accuracy:.4f}")
    print(f"  F1 Weighted:      {test_f1:.4f}")
    print(f"  F1 Macro:         {test_f1_macro:.4f}")
    print(f"\n  Classification Report (TEST):")
    print(classification_report(y_test, y_pred_test, target_names=LABELS))

    plot_confusion_matrix(y_test, y_pred_test, "RF Optimizado (TEST)",
                          FIG_DIR / "06_confusion_rf_test_final.png")

    # ==================================================================
    # SERIALIZACIÓN DEL MODELO FINAL
    # ==================================================================
    print("=" * 70)
    print("SERIALIZACION DEL MODELO FINAL")
    print("=" * 70)

    model_path = MODELS_DIR / "burnout_classifier.pkl"
    joblib.dump(best_rf, model_path)
    print(f"\n  Modelo serializado: {model_path}")
    print(f"  Algoritmo: Random Forest (optimizado)")
    print(f"  Hiperparametros: {grid_search.best_params_}")

    # ==================================================================
    # TABLA COMPARATIVA
    # ==================================================================
    print("\n" + "=" * 70)
    print("TABLA COMPARATIVA DE MODELOS")
    print("=" * 70)

    comparison = pd.DataFrame(results)
    print(f"\n{comparison.to_string(index=False)}")

    # Guardar métricas
    comparison.to_csv(MODELS_DIR / "supervised_metrics.csv", index=False)

    # Gráfica comparativa
    fig, ax = plt.subplots(figsize=(12, 6))
    x = np.arange(len(comparison))
    width = 0.2

    metrics_to_plot = ["accuracy_val", "f1_weighted_val", "f1_macro_val"]
    colors = ["#3498db", "#2ecc71", "#e74c3c"]
    for i, (metric, color) in enumerate(zip(metrics_to_plot, colors)):
        bars = ax.bar(x + i*width, comparison[metric], width, label=metric, color=color, edgecolor='white')
        for bar in bars:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
                    f'{bar.get_height():.3f}', ha='center', fontsize=8, fontweight='bold')

    ax.set_xticks(x + width)
    ax.set_xticklabels(comparison["model"], fontsize=10)
    ax.set_ylabel("Score")
    ax.set_title("Comparacion de Modelos Supervisados", fontweight='bold')
    ax.legend()
    ax.set_ylim(0, 1.1)
    plt.tight_layout()
    plt.savefig(FIG_DIR / "07_comparacion_modelos.png", dpi=150, bbox_inches='tight')
    plt.close()

    print(f"\nGraficas guardadas en: {FIG_DIR}")
    print("\n" + "=" * 70)
    print("Modelos supervisados completados.")
    print("=" * 70)


if __name__ == "__main__":
    main()
