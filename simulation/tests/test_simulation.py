"""
==============================================================================
QUANTIFY — Pruebas de Simulacion del Dataset
==============================================================================

Etapa 16.2 del Proyecto Integrador.
Valida que el generador de datos cumple con las reglas documentadas
en simulation_rules.md.

Casos cubiertos:
  - SIM-001: Reglas de clasificacion de riesgo
  - SIM-002: Casos normales
  - SIM-003: Casos extremos (anomalias)
  - SIM-004: Coherencia entre variables correlacionadas
  - SIM-005: Reproducibilidad con semilla fija

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Agregar el directorio de simulacion al path para importar las funciones
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "simulation"))

from generate_dataset import (
    generate_demographics,
    generate_behavioral,
    generate_biometrics,
    generate_risk_label,
    inject_anomalies,
    inject_missing_values,
    SEED,
    N_USERS,
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(scope="module")
def full_dataset():
    """Genera un dataset completo usando las funciones del generador."""
    np.random.seed(SEED)
    df_demo = generate_demographics(N_USERS)
    df_behavior = generate_behavioral(N_USERS, df_demo["edad"].values)
    df_bio = generate_biometrics(
        N_USERS, df_demo["edad"].values, df_behavior["friccion_promedio"].values
    )
    df = pd.concat([df_demo, df_behavior, df_bio], axis=1)
    df = inject_anomalies(df, n_anomalies=150)
    df["riesgo_abandono"] = generate_risk_label(df)
    return df


@pytest.fixture(scope="module")
def small_dataset():
    """Genera un dataset pequeno para pruebas rapidas."""
    np.random.seed(SEED)
    n = 500
    df_demo = generate_demographics(n)
    df_behavior = generate_behavioral(n, df_demo["edad"].values)
    df_bio = generate_biometrics(
        n, df_demo["edad"].values, df_behavior["friccion_promedio"].values
    )
    df = pd.concat([df_demo, df_behavior, df_bio], axis=1)
    df["riesgo_abandono"] = generate_risk_label(df)
    return df


# ============================================================================
# SIM-001: REGLAS DE CLASIFICACION DE RIESGO
# ============================================================================

class TestReglasClasificacion:
    """Verifica que las reglas logicas de clasificacion del riesgo de abandono
    se aplican correctamente segun lo documentado en simulation_rules.md."""

    def test_riesgo_alto_adherencia_baja_friccion_alta(self):
        """Un usuario con baja adherencia y alta friccion debe ser Alto."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.30,
            "friccion_promedio": 7.0,
            "frecuencia_fallo_semanal": 3.0,
            "nivel_estres": 2,
            "horas_sueno": 7.0,
            "tendencia_crecimiento": 0.0,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Alto", (
            f"Esperado 'Alto', obtenido '{riesgo.iloc[0]}'"
        )

    def test_riesgo_alto_fallo_excesivo(self):
        """Un usuario con frecuencia de fallo > 4.5 debe ser Alto."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.80,
            "friccion_promedio": 3.0,
            "frecuencia_fallo_semanal": 5.0,
            "nivel_estres": 2,
            "horas_sueno": 7.0,
            "tendencia_crecimiento": 0.5,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Alto"

    def test_riesgo_alto_estres_y_poco_sueno(self):
        """Estres >= 4 con sueno < 5.5 debe clasificar como Alto."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.70,
            "friccion_promedio": 3.0,
            "frecuencia_fallo_semanal": 1.0,
            "nivel_estres": 4,
            "horas_sueno": 4.0,
            "tendencia_crecimiento": 0.3,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Alto"

    def test_riesgo_medio_adherencia_intermedia(self):
        """Adherencia entre 0.40 y 0.65 debe clasificar como Medio."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.50,
            "friccion_promedio": 3.0,
            "frecuencia_fallo_semanal": 1.0,
            "nivel_estres": 1,
            "horas_sueno": 8.0,
            "tendencia_crecimiento": 0.5,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Medio"

    def test_riesgo_medio_friccion_intermedia(self):
        """Friccion entre 4.5 y 6.0 debe clasificar como Medio."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.80,
            "friccion_promedio": 5.0,
            "frecuencia_fallo_semanal": 1.0,
            "nivel_estres": 1,
            "horas_sueno": 8.0,
            "tendencia_crecimiento": 0.5,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Medio"

    def test_riesgo_bajo_usuario_saludable(self):
        """Un usuario saludable sin condiciones de riesgo debe ser Bajo."""
        data = pd.DataFrame([{
            "tasa_adherencia": 0.85,
            "friccion_promedio": 2.0,
            "frecuencia_fallo_semanal": 0.5,
            "nivel_estres": 1,
            "horas_sueno": 8.5,
            "tendencia_crecimiento": 0.7,
        }])
        riesgo = generate_risk_label(data)
        assert riesgo.iloc[0] == "Bajo"


# ============================================================================
# SIM-002: CASOS NORMALES
# ============================================================================

class TestCasosNormales:
    """Verifica la generacion de datos bajo condiciones normales."""

    def test_demograficos_tamanio(self):
        """generate_demographics debe retornar exactamente N registros."""
        np.random.seed(SEED)
        df = generate_demographics(100)
        assert len(df) == 100

    def test_demograficos_columnas(self):
        """generate_demographics debe retornar las 4 columnas base."""
        np.random.seed(SEED)
        df = generate_demographics(10)
        esperadas = {"usuario_id", "edad", "genero", "dispositivo"}
        assert set(df.columns) == esperadas

    def test_conductuales_columnas(self):
        """generate_behavioral debe retornar las 6 columnas conductuales."""
        np.random.seed(SEED)
        edades = np.array([25, 30, 35])
        df = generate_behavioral(3, edades)
        esperadas = {
            "dias_activo", "tasa_adherencia", "friccion_promedio",
            "racha_maxima", "frecuencia_fallo_semanal", "tendencia_crecimiento"
        }
        assert set(df.columns) == esperadas

    def test_biometricos_columnas(self):
        """generate_biometrics debe retornar las 5 columnas biometricas."""
        np.random.seed(SEED)
        edades = np.array([25, 30, 35])
        friccion = np.array([3.0, 5.0, 7.0])
        df = generate_biometrics(3, edades, friccion)
        esperadas = {
            "horas_sueno", "pasos_diarios", "fc_media",
            "spo2_promedio", "nivel_estres"
        }
        assert set(df.columns) == esperadas


# ============================================================================
# SIM-003: CASOS EXTREMOS (ANOMALIAS)
# ============================================================================

class TestCasosExtremos:
    """Verifica que las anomalias inyectadas existen y son correctas."""

    def test_usuarios_fantasma_existen(self, full_dataset):
        """Deben existir usuarios con dias_activo < 3 (fantasmas)."""
        fantasmas = (full_dataset["dias_activo"] < 3).sum()
        assert fantasmas >= 40, (
            f"Se esperaban al menos 40 usuarios fantasma, encontrados {fantasmas}"
        )

    def test_super_usuarios_burnout(self, full_dataset):
        """Deben existir usuarios con adherencia > 0.95 y estres = 5."""
        burnout = (
            (full_dataset["tasa_adherencia"] > 0.95) &
            (full_dataset["nivel_estres"] == 5)
        ).sum()
        assert burnout >= 30, (
            f"Se esperaban al menos 30 super usuarios con burnout, "
            f"encontrados {burnout}"
        )

    def test_outliers_biometricos(self, full_dataset):
        """Deben existir outliers con FC > 100 y SpO2 < 92."""
        outliers = (
            (full_dataset["fc_media"] > 100) &
            (full_dataset["spo2_promedio"] < 92)
        ).sum()
        assert outliers >= 25, (
            f"Se esperaban al menos 25 outliers biometricos, "
            f"encontrados {outliers}"
        )

    def test_casos_frontera_adherencia(self, full_dataset):
        """Deben existir registros con valores exactos en umbrales."""
        umbrales = [0.39, 0.40, 0.41, 0.64, 0.65, 0.66]
        frontera = full_dataset["tasa_adherencia"].isin(umbrales).sum()
        assert frontera >= 10, (
            f"Se esperaban al menos 10 casos frontera, encontrados {frontera}"
        )


# ============================================================================
# SIM-004: COHERENCIA ENTRE VARIABLES CORRELACIONADAS
# ============================================================================

class TestCoherencia:
    """Verifica las correlaciones esperadas entre variables segun las
    reglas de simulacion documentadas."""

    def test_correlacion_adherencia_friccion_negativa(self, full_dataset):
        """La correlacion entre adherencia y friccion debe ser negativa (~-0.50)."""
        corr = full_dataset["tasa_adherencia"].corr(
            full_dataset["friccion_promedio"]
        )
        assert corr < -0.30, (
            f"Correlacion adherencia-friccion: {corr:.3f}, esperada < -0.30"
        )

    def test_correlacion_adherencia_racha_positiva(self, full_dataset):
        """La correlacion entre adherencia y racha maxima debe ser positiva (~0.65)."""
        corr = full_dataset["tasa_adherencia"].corr(
            full_dataset["racha_maxima"]
        )
        assert corr > 0.30, (
            f"Correlacion adherencia-racha: {corr:.3f}, esperada > 0.30"
        )

    def test_correlacion_friccion_fallo_positiva(self, full_dataset):
        """La correlacion entre friccion y frecuencia de fallo debe ser positiva (~0.55)."""
        corr = full_dataset["friccion_promedio"].corr(
            full_dataset["frecuencia_fallo_semanal"]
        )
        assert corr > 0.35, (
            f"Correlacion friccion-fallo: {corr:.3f}, esperada > 0.35"
        )

    def test_correlacion_friccion_sueno_negativa(self, full_dataset):
        """La correlacion entre friccion y horas de sueno debe ser negativa (~-0.35)."""
        corr = full_dataset["friccion_promedio"].corr(
            full_dataset["horas_sueno"].dropna()
        )
        assert corr < -0.15, (
            f"Correlacion friccion-sueno: {corr:.3f}, esperada < -0.15"
        )


# ============================================================================
# SIM-005: REPRODUCIBILIDAD CON SEMILLA FIJA
# ============================================================================

class TestReproducibilidad:
    """Verifica que el generador produce resultados identicos con la misma semilla."""

    def test_dos_ejecuciones_identicas(self):
        """Dos ejecuciones con la misma semilla deben producir el mismo DataFrame."""
        # Primera ejecucion
        np.random.seed(SEED)
        df1_demo = generate_demographics(100)
        df1_beh = generate_behavioral(100, df1_demo["edad"].values)

        # Segunda ejecucion
        np.random.seed(SEED)
        df2_demo = generate_demographics(100)
        df2_beh = generate_behavioral(100, df2_demo["edad"].values)

        pd.testing.assert_frame_equal(df1_demo, df2_demo)
        pd.testing.assert_frame_equal(df1_beh, df2_beh)

    def test_semilla_distinta_produce_datos_distintos(self):
        """Con semilla diferente, los datos deben ser distintos."""
        np.random.seed(SEED)
        df1 = generate_demographics(100)

        np.random.seed(9999)
        df2 = generate_demographics(100)

        # Las edades deben diferir (probabilidad astronómica de ser iguales)
        assert not df1["edad"].equals(df2["edad"]), (
            "Dos semillas diferentes produjeron las mismas edades"
        )

    def test_nulos_reproducibles(self):
        """La inyeccion de nulos tambien debe ser reproducible."""
        np.random.seed(SEED)
        df1 = generate_demographics(200)
        df1_beh = generate_behavioral(200, df1["edad"].values)
        df1_bio = generate_biometrics(200, df1["edad"].values, df1_beh["friccion_promedio"].values)
        df1_full = pd.concat([df1, df1_beh, df1_bio], axis=1)
        df1_nulls = inject_missing_values(df1_full)

        np.random.seed(SEED)
        df2 = generate_demographics(200)
        df2_beh = generate_behavioral(200, df2["edad"].values)
        df2_bio = generate_biometrics(200, df2["edad"].values, df2_beh["friccion_promedio"].values)
        df2_full = pd.concat([df2, df2_beh, df2_bio], axis=1)
        df2_nulls = inject_missing_values(df2_full)

        # Los indices de nulos deben ser identicos
        for col in ["horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"]:
            mask1 = df1_nulls[col].isnull()
            mask2 = df2_nulls[col].isnull()
            assert mask1.equals(mask2), (
                f"Nulos no reproducibles en columna {col}"
            )
