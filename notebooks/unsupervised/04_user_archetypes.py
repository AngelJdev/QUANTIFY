"""
==============================================================================
QUANTIFY — Modelos No Supervisados (Segmentación de Arquetipos)
==============================================================================

Etapa 11 del Proyecto Integrador.
Metodología CRISP-DM: Fase 4 — Modelado (No Supervisado).

Algoritmos:
  - K-Means Clustering (Agrupamiento)
  - PCA (Reducción de Dimensionalidad)
  - t-SNE (Comparación visual)

Métricas: Silhouette Score, Davies-Bouldin, Inercia, Varianza Explicada

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
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score, davies_bouldin_score

SEED = 2026
np.random.seed(SEED)

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
TRAIN_FILE = BASE_DIR / "data" / "training" / "train.csv"
PROCESSED_FILE = BASE_DIR / "data" / "processed" / "quantify_clean.csv"
MODELS_DIR = BASE_DIR / "models" / "serialized"
FIG_DIR = BASE_DIR / "notebooks" / "unsupervised" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# Feature config
with open(MODELS_DIR / "feature_config.json", "r") as f:
    config = json.load(f)[0]

NUMERIC_FEATURES = config["numeric_features"]


def main():
    print("=" * 70)
    print("QUANTIFY -- Modelos No Supervisados (Etapa 11)")
    print("=" * 70)

    # Cargar datos de training (escalados)
    train = pd.read_csv(TRAIN_FILE)
    X_train = train[NUMERIC_FEATURES]
    y_train_real = train["riesgo_abandono"]  # Solo para validación visual

    # Cargar datos completos procesados
    df_full = pd.read_csv(PROCESSED_FILE)

    print(f"\nDatos de training: {len(X_train)} registros, {len(NUMERIC_FEATURES)} features numericos")

    # ==================================================================
    # 1. K-MEANS: SELECCIÓN DE K (MÉTODO DEL CODO + SILHOUETTE)
    # ==================================================================
    print("\n" + "=" * 70)
    print("1. SELECCION DE K OPTIMO")
    print("=" * 70)

    k_range = range(2, 11)
    inertias = []
    silhouettes = []
    davies_bouldins = []

    for k in k_range:
        km = KMeans(n_clusters=k, random_state=SEED, n_init=10, max_iter=300)
        labels = km.fit_predict(X_train)
        inertias.append(km.inertia_)
        sil = silhouette_score(X_train, labels)
        db = davies_bouldin_score(X_train, labels)
        silhouettes.append(sil)
        davies_bouldins.append(db)
        print(f"  k={k}: Inercia={km.inertia_:.1f} | Silhouette={sil:.4f} | Davies-Bouldin={db:.4f}")

    # Gráfica del codo + Silhouette
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    # Método del codo
    axes[0].plot(list(k_range), inertias, 'bo-', linewidth=2, markersize=8)
    axes[0].set_xlabel("Numero de Clusters (k)")
    axes[0].set_ylabel("Inercia")
    axes[0].set_title("Metodo del Codo", fontweight='bold')
    axes[0].grid(True, alpha=0.3)

    # Silhouette Score
    axes[1].plot(list(k_range), silhouettes, 'go-', linewidth=2, markersize=8)
    axes[1].set_xlabel("Numero de Clusters (k)")
    axes[1].set_ylabel("Silhouette Score")
    axes[1].set_title("Silhouette Score por k", fontweight='bold')
    axes[1].grid(True, alpha=0.3)
    best_k_sil = list(k_range)[np.argmax(silhouettes)]
    axes[1].axvline(best_k_sil, color='red', linestyle='--', label=f'Mejor k={best_k_sil}')
    axes[1].legend()

    # Davies-Bouldin
    axes[2].plot(list(k_range), davies_bouldins, 'ro-', linewidth=2, markersize=8)
    axes[2].set_xlabel("Numero de Clusters (k)")
    axes[2].set_ylabel("Davies-Bouldin Index")
    axes[2].set_title("Davies-Bouldin por k (menor=mejor)", fontweight='bold')
    axes[2].grid(True, alpha=0.3)

    plt.suptitle("Seleccion del Numero Optimo de Clusters", fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(FIG_DIR / "01_seleccion_k.png", dpi=150, bbox_inches='tight')
    plt.close()

    # Seleccionar k=3 (por contexto: corresponde a Bajo/Medio/Alto)
    K_FINAL = 3
    print(f"\n  K seleccionado: {K_FINAL}")
    print(f"  Justificacion: Corresponde al numero de perfiles de riesgo (Bajo/Medio/Alto)")
    print(f"  Silhouette Score para k={K_FINAL}: {silhouettes[K_FINAL-2]:.4f}")

    # ==================================================================
    # 2. K-MEANS FINAL CON K=3
    # ==================================================================
    print("\n" + "=" * 70)
    print(f"2. K-MEANS FINAL (k={K_FINAL})")
    print("=" * 70)

    kmeans_final = KMeans(n_clusters=K_FINAL, random_state=SEED, n_init=20, max_iter=500)
    cluster_labels = kmeans_final.fit_predict(X_train)

    train_with_clusters = X_train.copy()
    train_with_clusters["cluster"] = cluster_labels
    train_with_clusters["riesgo_real"] = y_train_real.values

    # Perfiles de cada cluster
    print(f"\n  Perfiles de clusters:")
    for c in range(K_FINAL):
        subset = train_with_clusters[train_with_clusters["cluster"] == c]
        print(f"\n  --- Cluster {c} ({len(subset)} usuarios, {len(subset)/len(X_train)*100:.1f}%) ---")
        for feat in ["tasa_adherencia", "friccion_promedio", "racha_maxima",
                      "nivel_estres", "horas_sueno", "dias_activo"]:
            print(f"    {feat}: media={subset[feat].mean():.3f}")
        # Distribución de riesgo real en este cluster
        dist = subset["riesgo_real"].value_counts()
        for label, count in dist.items():
            print(f"    [{label}]: {count} ({count/len(subset)*100:.1f}%)")

    # Asignar nombres descriptivos a los clusters
    cluster_means = train_with_clusters.groupby("cluster")["tasa_adherencia"].mean()
    sorted_clusters = cluster_means.sort_values(ascending=False).index.tolist()
    cluster_names = {}
    names_list = ["Guerreros Consistentes", "Exploradores Intermitentes", "En Riesgo de Abandono"]
    for i, c in enumerate(sorted_clusters):
        cluster_names[c] = names_list[i]

    print(f"\n  Nombres asignados:")
    for c, name in cluster_names.items():
        print(f"    Cluster {c}: \"{name}\"")

    # ==================================================================
    # 3. PCA (REDUCCIÓN DE DIMENSIONALIDAD)
    # ==================================================================
    print("\n" + "=" * 70)
    print("3. PCA (REDUCCION DE DIMENSIONALIDAD)")
    print("=" * 70)

    pca = PCA(n_components=len(NUMERIC_FEATURES), random_state=SEED)
    X_pca_all = pca.fit_transform(X_train)

    # Varianza explicada
    cumulative_var = np.cumsum(pca.explained_variance_ratio_)
    print(f"\n  Varianza explicada acumulada:")
    for i, (var, cum) in enumerate(zip(pca.explained_variance_ratio_, cumulative_var)):
        marker = " <<<" if cum >= 0.90 and (i == 0 or cumulative_var[i-1] < 0.90) else ""
        print(f"    PC{i+1}: {var:.4f} (acumulada: {cum:.4f}){marker}")

    n_components_90 = np.argmax(cumulative_var >= 0.90) + 1
    print(f"\n  Componentes para 90% varianza: {n_components_90}")

    # Gráfica de varianza explicada
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    axes[0].bar(range(1, len(pca.explained_variance_ratio_) + 1),
                pca.explained_variance_ratio_, color='#3498db', edgecolor='white', alpha=0.8)
    axes[0].set_xlabel("Componente Principal")
    axes[0].set_ylabel("Varianza Explicada")
    axes[0].set_title("Varianza Explicada por Componente", fontweight='bold')

    axes[1].plot(range(1, len(cumulative_var) + 1), cumulative_var, 'go-', linewidth=2)
    axes[1].axhline(0.90, color='red', linestyle='--', label='90% varianza')
    axes[1].axvline(n_components_90, color='red', linestyle=':', alpha=0.5)
    axes[1].set_xlabel("Numero de Componentes")
    axes[1].set_ylabel("Varianza Acumulada")
    axes[1].set_title("Varianza Acumulada", fontweight='bold')
    axes[1].legend()

    plt.tight_layout()
    plt.savefig(FIG_DIR / "02_pca_varianza.png", dpi=150, bbox_inches='tight')
    plt.close()

    # Proyección 2D coloreada por cluster
    pca_2d = PCA(n_components=2, random_state=SEED)
    X_2d = pca_2d.fit_transform(X_train)

    cluster_colors = {0: '#e74c3c', 1: '#3498db', 2: '#2ecc71'}

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Por cluster
    for c in range(K_FINAL):
        mask = cluster_labels == c
        axes[0].scatter(X_2d[mask, 0], X_2d[mask, 1],
                        c=cluster_colors[c], alpha=0.4, s=10,
                        label=f'C{c}: {cluster_names[c]}')
    # Centroides
    centroids_2d = pca_2d.transform(kmeans_final.cluster_centers_)
    axes[0].scatter(centroids_2d[:, 0], centroids_2d[:, 1],
                    c='black', marker='X', s=200, edgecolors='white', linewidth=2,
                    label='Centroides', zorder=5)
    axes[0].set_xlabel(f"PC1 ({pca_2d.explained_variance_ratio_[0]*100:.1f}%)")
    axes[0].set_ylabel(f"PC2 ({pca_2d.explained_variance_ratio_[1]*100:.1f}%)")
    axes[0].set_title("Proyeccion PCA 2D (por Cluster)", fontweight='bold')
    axes[0].legend(fontsize=8, loc='best')

    # Por riesgo real (comparación)
    risk_colors = {'Bajo': '#2ecc71', 'Medio': '#f39c12', 'Alto': '#e74c3c'}
    for risk in ['Bajo', 'Medio', 'Alto']:
        mask = y_train_real.values == risk
        axes[1].scatter(X_2d[mask, 0], X_2d[mask, 1],
                        c=risk_colors[risk], alpha=0.4, s=10, label=risk)
    axes[1].set_xlabel(f"PC1 ({pca_2d.explained_variance_ratio_[0]*100:.1f}%)")
    axes[1].set_ylabel(f"PC2 ({pca_2d.explained_variance_ratio_[1]*100:.1f}%)")
    axes[1].set_title("Proyeccion PCA 2D (por Riesgo Real)", fontweight='bold')
    axes[1].legend(fontsize=8, loc='best')

    plt.suptitle("Comparacion: Clusters vs Etiquetas Reales en 2D", fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(FIG_DIR / "03_pca_2d_clusters_vs_riesgo.png", dpi=150, bbox_inches='tight')
    plt.close()

    # ==================================================================
    # 4. t-SNE (COMPARACIÓN VISUAL)
    # ==================================================================
    print("\n" + "=" * 70)
    print("4. t-SNE (COMPARACION VISUAL)")
    print("=" * 70)

    # Usar un subconjunto para velocidad
    sample_size = min(2000, len(X_train))
    idx = np.random.choice(len(X_train), sample_size, replace=False)
    X_sample = X_train.iloc[idx]
    clusters_sample = cluster_labels[idx]
    risk_sample = y_train_real.values[idx]

    tsne = TSNE(n_components=2, random_state=SEED, perplexity=30)
    X_tsne = tsne.fit_transform(X_sample)

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    for c in range(K_FINAL):
        mask = clusters_sample == c
        axes[0].scatter(X_tsne[mask, 0], X_tsne[mask, 1],
                        c=cluster_colors[c], alpha=0.5, s=10,
                        label=f'C{c}: {cluster_names[c]}')
    axes[0].set_title("t-SNE (por Cluster K-Means)", fontweight='bold')
    axes[0].legend(fontsize=8)

    for risk in ['Bajo', 'Medio', 'Alto']:
        mask = risk_sample == risk
        axes[1].scatter(X_tsne[mask, 0], X_tsne[mask, 1],
                        c=risk_colors[risk], alpha=0.5, s=10, label=risk)
    axes[1].set_title("t-SNE (por Riesgo Real)", fontweight='bold')
    axes[1].legend(fontsize=8)

    plt.suptitle("t-SNE: Clusters vs Etiquetas Reales", fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(FIG_DIR / "04_tsne_clusters_vs_riesgo.png", dpi=150, bbox_inches='tight')
    plt.close()

    print(f"  t-SNE completado con {sample_size} muestras")

    # ==================================================================
    # 5. SERIALIZACIÓN
    # ==================================================================
    print("\n" + "=" * 70)
    print("5. SERIALIZACION DE MODELOS")
    print("=" * 70)

    # K-Means
    kmeans_path = MODELS_DIR / "kmeans_archetypes.pkl"
    joblib.dump(kmeans_final, kmeans_path)
    print(f"  K-Means: {kmeans_path}")

    # PCA
    pca_path = MODELS_DIR / "pca_reducer.pkl"
    joblib.dump(pca_2d, pca_path)
    print(f"  PCA (2D): {pca_path}")

    # Metadata de clusters
    cluster_meta = {
        "k": K_FINAL,
        "cluster_names": cluster_names,
        "silhouette_score": float(silhouettes[K_FINAL - 2]),
        "davies_bouldin_score": float(davies_bouldins[K_FINAL - 2]),
        "inertia": float(inertias[K_FINAL - 2]),
        "pca_variance_explained_2d": [float(v) for v in pca_2d.explained_variance_ratio_],
        "pca_components_for_90pct": int(n_components_90),
    }
    with open(MODELS_DIR / "unsupervised_metadata.json", "w") as f:
        json.dump(cluster_meta, f, indent=2)
    print(f"  Metadata: {MODELS_DIR / 'unsupervised_metadata.json'}")

    # ==================================================================
    # RESUMEN FINAL
    # ==================================================================
    print("\n" + "=" * 70)
    print("RESUMEN FINAL")
    print("=" * 70)
    print(f"""
  K-Means:
    k = {K_FINAL}
    Silhouette Score = {silhouettes[K_FINAL-2]:.4f}
    Davies-Bouldin = {davies_bouldins[K_FINAL-2]:.4f}
    Clusters: {cluster_names}

  PCA:
    Componentes para 90% varianza: {n_components_90}
    Varianza PC1: {pca_2d.explained_variance_ratio_[0]*100:.1f}%
    Varianza PC2: {pca_2d.explained_variance_ratio_[1]*100:.1f}%

  Modelos serializados:
    - models/serialized/kmeans_archetypes.pkl
    - models/serialized/pca_reducer.pkl
    - models/serialized/unsupervised_metadata.json
    """)

    figs = sorted(FIG_DIR.glob("*.png"))
    print(f"  Graficas generadas ({len(figs)}):")
    for f in figs:
        print(f"    - {f.name}")

    print("\n" + "=" * 70)
    print("Modelos no supervisados completados.")
    print("=" * 70)


if __name__ == "__main__":
    main()
