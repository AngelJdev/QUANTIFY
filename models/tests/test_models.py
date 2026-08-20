"""
==============================================================================
QUANTIFY — Pruebas de Modelos de Machine Learning
==============================================================================

Etapa 16.4 del Proyecto Integrador.
Valida el desempenio, estabilidad y robustez de los modelos serializados
(RandomForest clasificador y KMeans arquetipos).

Casos cubiertos:
  - ML-001: Metricas del modelo supervisado
  - ML-002: Generalizacion (diferencia train/val)
  - ML-003: Estabilidad (misma entrada, misma salida)
  - ML-004: Sobreajuste (comparacion train vs val)
  - ML-005: Casos frontera (umbrales de clasificacion)
  - ML-006: Entradas inesperadas (negativos, NaN, extremos)

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import pytest
import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path

# ============================================================================
# CONFIGURACION
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "serialized"
DATA_DIR = BASE_DIR / "data" / "processed"


@pytest.fixture(scope="module")
def rf_model():
    """Carga el modelo RandomForest serializado."""
    path = MODELS_DIR / "burnout_classifier.pkl"
    assert path.exists(), f"Modelo no encontrado: {path}"
    return joblib.load(path)


@pytest.fixture(scope="module")
def kmeans_model():
    """Carga el modelo KMeans serializado."""
    path = MODELS_DIR / "kmeans_archetypes.pkl"
    assert path.exists(), f"Modelo no encontrado: {path}"
    return joblib.load(path)


@pytest.fixture(scope="module")
def feature_config():
    """Carga la configuracion de features."""
    path = MODELS_DIR / "feature_config.json"
    assert path.exists(), f"Configuracion no encontrada: {path}"
    with open(path, "r") as f:
        config = json.load(f)
    return config[0]


@pytest.fixture(scope="module")
def supervised_metrics():
    """Carga las metricas del modelo supervisado."""
    path = MODELS_DIR / "supervised_metrics.csv"
    assert path.exists(), f"Metricas no encontradas: {path}"
    return pd.read_csv(path)


@pytest.fixture(scope="module")
def unsupervised_meta():
    """Carga la metadata del modelo no supervisado."""
    path = MODELS_DIR / "unsupervised_metadata.json"
    assert path.exists(), f"Metadata no encontrada: {path}"
    with open(path, "r") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def sample_input(feature_config):
    """Genera una entrada de ejemplo valida para los modelos."""
    data = {
        "edad": 28,
        "dias_activo": 90,
        "tasa_adherencia": 0.65,
        "friccion_promedio": 4.5,
        "racha_maxima": 30,
        "frecuencia_fallo_semanal": 2.0,
        "tendencia_crecimiento": 0.1,
        "horas_sueno": 7.0,
        "pasos_diarios": 8000,
        "fc_media": 72.0,
        "spo2_promedio": 97.0,
        "nivel_estres": 2,
        "indice_riesgo_compuesto": 0.35,
        "ratio_adherencia_friccion": 0.14,
        "eficiencia_racha": 0.33,
        "genero_Femenino": 0,
        "genero_Masculino": 1,
        "genero_No Binario": 0,
        "disp_Smartwatch": 0,
        "disp_Web": 1,
        "disp_Web+Smartwatch": 0,
    }
    return data


# ============================================================================
# ML-001: METRICAS DEL MODELO SUPERVISADO
# ============================================================================

class TestMetricas:
    """Verifica que las metricas del modelo cumplen los umbrales minimos."""

    def test_accuracy_validacion_superior_95(self, supervised_metrics):
        """El accuracy de validacion del RF Optimizado debe ser > 95%."""
        rf_opt = supervised_metrics[supervised_metrics["model"] == "RF Optimizado"]
        if len(rf_opt) > 0:
            acc = rf_opt["accuracy_val"].values[0]
            assert acc > 0.95, (
                f"Accuracy de validacion del RF Optimizado: {acc:.4f}, "
                f"esperado > 0.95"
            )
        else:
            rf = supervised_metrics[supervised_metrics["model"] == "Random Forest"]
            acc = rf["accuracy_val"].values[0]
            assert acc > 0.95, (
                f"Accuracy de validacion del Random Forest: {acc:.4f}, "
                f"esperado > 0.95"
            )

    def test_f1_weighted_superior_95(self, supervised_metrics):
        """El F1-weighted debe ser > 0.95 para validar equilibrio entre clases."""
        rf_opt = supervised_metrics[supervised_metrics["model"] == "RF Optimizado"]
        if len(rf_opt) > 0:
            f1 = rf_opt["f1_weighted_val"].values[0]
        else:
            rf = supervised_metrics[supervised_metrics["model"] == "Random Forest"]
            f1 = rf["f1_weighted_val"].values[0]
        assert f1 > 0.95, f"F1-weighted: {f1:.4f}, esperado > 0.95"

    def test_precision_y_recall_equilibrados(self, supervised_metrics):
        """Precision y recall no deben diferir mas de 5 puntos porcentuales."""
        rf_opt = supervised_metrics[supervised_metrics["model"] == "RF Optimizado"]
        if len(rf_opt) > 0:
            precision = rf_opt["precision_val"].values[0]
            recall = rf_opt["recall_val"].values[0]
        else:
            rf = supervised_metrics[supervised_metrics["model"] == "Random Forest"]
            precision = rf["precision_val"].values[0]
            recall = rf["recall_val"].values[0]
        diff = abs(precision - recall)
        assert diff < 0.05, (
            f"Diferencia precision-recall: {diff:.4f}, esperada < 0.05"
        )


# ============================================================================
# ML-002: GENERALIZACION
# ============================================================================

class TestGeneralizacion:
    """Verifica que la diferencia entre entrenamiento y validacion es aceptable."""

    def test_diferencia_train_val_menor_5_porciento(self, supervised_metrics):
        """La diferencia de accuracy entre train y val debe ser < 5%."""
        rf_opt = supervised_metrics[supervised_metrics["model"] == "RF Optimizado"]
        if len(rf_opt) > 0:
            acc_train = rf_opt["accuracy_train"].values[0]
            acc_val = rf_opt["accuracy_val"].values[0]
        else:
            rf = supervised_metrics[supervised_metrics["model"] == "Random Forest"]
            acc_train = rf["accuracy_train"].values[0]
            acc_val = rf["accuracy_val"].values[0]

        diff = abs(acc_train - acc_val)
        assert diff < 0.05, (
            f"Diferencia train-val: {diff:.4f} ({acc_train:.4f} vs {acc_val:.4f}), "
            f"indica posible sobreajuste"
        )


# ============================================================================
# ML-003: ESTABILIDAD
# ============================================================================

class TestEstabilidad:
    """Verifica que el modelo produce resultados consistentes."""

    def test_misma_entrada_misma_salida(self, rf_model, feature_config, sample_input):
        """La misma entrada debe producir la misma prediccion siempre."""
        df = pd.DataFrame([sample_input], columns=feature_config["all_features"]).fillna(0)
        pred1 = rf_model.predict(df)[0]
        pred2 = rf_model.predict(df)[0]
        pred3 = rf_model.predict(df)[0]
        assert pred1 == pred2 == pred3, (
            f"Predicciones inconsistentes: {pred1}, {pred2}, {pred3}"
        )

    def test_probabilidades_consistentes(self, rf_model, feature_config, sample_input):
        """Las probabilidades de prediccion deben ser consistentes."""
        df = pd.DataFrame([sample_input], columns=feature_config["all_features"]).fillna(0)
        proba1 = rf_model.predict_proba(df)[0]
        proba2 = rf_model.predict_proba(df)[0]
        np.testing.assert_array_almost_equal(
            proba1, proba2, decimal=10,
            err_msg="Probabilidades no son consistentes entre ejecuciones"
        )

    def test_kmeans_mismo_cluster(self, kmeans_model, feature_config, sample_input):
        """KMeans debe asignar el mismo cluster a la misma entrada."""
        numeric_data = {k: sample_input[k] for k in feature_config["numeric_features"]}
        df = pd.DataFrame([numeric_data], columns=feature_config["numeric_features"]).fillna(0)
        cluster1 = kmeans_model.predict(df)[0]
        cluster2 = kmeans_model.predict(df)[0]
        assert cluster1 == cluster2


# ============================================================================
# ML-004: SOBREAJUSTE
# ============================================================================

class TestSobreajuste:
    """Evalua indicadores de sobreajuste en el modelo."""

    def test_accuracy_train_no_perfecta(self, supervised_metrics):
        """Si accuracy_train es 100% y val < 95%, hay sobreajuste severo."""
        for _, row in supervised_metrics.iterrows():
            if row["accuracy_train"] == 1.0:
                assert row["accuracy_val"] >= 0.95, (
                    f"Modelo '{row['model']}' tiene accuracy_train=1.0 pero "
                    f"accuracy_val={row['accuracy_val']:.4f}, sobreajuste detectado"
                )

    def test_f1_macro_aceptable(self, supervised_metrics):
        """El F1 macro debe ser > 0.90 para todos los modelos principales."""
        rf = supervised_metrics[
            supervised_metrics["model"].isin(["Random Forest", "RF Optimizado"])
        ]
        for _, row in rf.iterrows():
            assert row["f1_macro_val"] > 0.90, (
                f"Modelo '{row['model']}': F1-macro={row['f1_macro_val']:.4f}, "
                f"esperado > 0.90"
            )


# ============================================================================
# ML-005: CASOS FRONTERA
# ============================================================================

class TestCasosFrontera:
    """Verifica predicciones en los umbrales exactos de clasificacion."""

    def test_umbral_adherencia_040(self, rf_model, feature_config, sample_input):
        """Prediccion con adherencia exactamente en 0.40 (umbral medio/alto)."""
        data = sample_input.copy()
        data["tasa_adherencia"] = 0.40
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        pred = rf_model.predict(df)[0]
        # Debe producir una prediccion valida sin error
        assert pred in ["Alto", "Medio", "Bajo", 0, 1, 2], (
            f"Prediccion invalida en umbral: {pred}"
        )

    def test_umbral_adherencia_065(self, rf_model, feature_config, sample_input):
        """Prediccion con adherencia exactamente en 0.65 (umbral bajo/medio)."""
        data = sample_input.copy()
        data["tasa_adherencia"] = 0.65
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        pred = rf_model.predict(df)[0]
        assert pred in ["Alto", "Medio", "Bajo", 0, 1, 2]

    def test_umbral_friccion_60(self, rf_model, feature_config, sample_input):
        """Prediccion con friccion exactamente en 6.0."""
        data = sample_input.copy()
        data["friccion_promedio"] = 6.0
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        pred = rf_model.predict(df)[0]
        assert pred in ["Alto", "Medio", "Bajo", 0, 1, 2]

    def test_todos_los_valores_minimos(self, rf_model, feature_config):
        """Prediccion con todos los valores en su minimo posible."""
        data = {f: 0 for f in feature_config["all_features"]}
        data["edad"] = 16
        data["dias_activo"] = 0
        data["tasa_adherencia"] = 0.0
        data["friccion_promedio"] = 1.0
        data["nivel_estres"] = 1
        data["horas_sueno"] = 3.0
        data["spo2_promedio"] = 90.0
        data["fc_media"] = 50.0
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        pred = rf_model.predict(df)[0]
        assert pred in ["Alto", "Medio", "Bajo", 0, 1, 2]

    def test_todos_los_valores_maximos(self, rf_model, feature_config):
        """Prediccion con todos los valores en su maximo posible."""
        data = {f: 0 for f in feature_config["all_features"]}
        data["edad"] = 65
        data["dias_activo"] = 180
        data["tasa_adherencia"] = 0.99
        data["friccion_promedio"] = 10.0
        data["racha_maxima"] = 180
        data["frecuencia_fallo_semanal"] = 7.0
        data["tendencia_crecimiento"] = 1.0
        data["horas_sueno"] = 10.0
        data["pasos_diarios"] = 30000
        data["fc_media"] = 110.0
        data["spo2_promedio"] = 100.0
        data["nivel_estres"] = 5
        data["indice_riesgo_compuesto"] = 1.0
        data["ratio_adherencia_friccion"] = 1.0
        data["eficiencia_racha"] = 1.0
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        pred = rf_model.predict(df)[0]
        assert pred in ["Alto", "Medio", "Bajo", 0, 1, 2]


# ============================================================================
# ML-006: ENTRADAS INESPERADAS
# ============================================================================

class TestEntradasInesperadas:
    """Verifica el comportamiento del modelo ante entradas no convencionales."""

    def test_valores_negativos(self, rf_model, feature_config, sample_input):
        """El modelo debe manejar valores negativos sin crashear."""
        data = sample_input.copy()
        data["tasa_adherencia"] = -0.5
        data["friccion_promedio"] = -1.0
        data["pasos_diarios"] = -100
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        try:
            pred = rf_model.predict(df)[0]
            assert pred is not None, "Prediccion nula con valores negativos"
        except Exception as e:
            pytest.fail(f"El modelo crasheo con valores negativos: {e}")

    def test_valores_extremos_altos(self, rf_model, feature_config, sample_input):
        """El modelo debe manejar valores extremadamente altos."""
        data = sample_input.copy()
        data["pasos_diarios"] = 999999
        data["fc_media"] = 500.0
        data["edad"] = 200
        df = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        try:
            pred = rf_model.predict(df)[0]
            assert pred is not None
        except Exception as e:
            pytest.fail(f"El modelo crasheo con valores extremos: {e}")

    def test_valores_cero(self, rf_model, feature_config):
        """El modelo debe manejar un vector de ceros."""
        data = {f: 0 for f in feature_config["all_features"]}
        df = pd.DataFrame([data], columns=feature_config["all_features"])
        try:
            pred = rf_model.predict(df)[0]
            assert pred is not None
        except Exception as e:
            pytest.fail(f"El modelo crasheo con vector de ceros: {e}")

    def test_cluster_con_valores_negativos(self, kmeans_model, feature_config):
        """KMeans debe asignar un cluster valido incluso con negativos."""
        data = {f: -1.0 for f in feature_config["numeric_features"]}
        df = pd.DataFrame([data], columns=feature_config["numeric_features"])
        try:
            cluster = kmeans_model.predict(df)[0]
            assert 0 <= cluster < 3, f"Cluster fuera de rango: {cluster}"
        except Exception as e:
            pytest.fail(f"KMeans crasheo con valores negativos: {e}")

    def test_modelo_retorna_clases_validas(self, rf_model, feature_config, sample_input):
        """Las clases predichas deben pertenecer al conjunto conocido."""
        df = pd.DataFrame([sample_input], columns=feature_config["all_features"]).fillna(0)
        clases = rf_model.classes_
        pred = rf_model.predict(df)[0]
        assert pred in clases, (
            f"Prediccion '{pred}' no esta en las clases del modelo: {clases}"
        )
