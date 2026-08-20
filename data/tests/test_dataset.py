"""
==============================================================================
QUANTIFY — Pruebas del Dataset de Telemetria
==============================================================================

Etapa 16.1 del Proyecto Integrador.
Valida la calidad e integridad del dataset crudo generado por la simulacion.

Casos cubiertos:
  - DS-001: Rangos numericos
  - DS-002: Valores nulos controlados
  - DS-003: Duplicados en usuario_id
  - DS-004: Integridad referencial (formato de IDs)
  - DS-005: Distribucion de la variable objetivo
  - DS-006: Balance de clases
  - DS-007: Tipos de datos

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import pytest
import pandas as pd
import numpy as np
import re
from pathlib import Path

# ============================================================================
# CONFIGURACION Y FIXTURES
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_FILE = BASE_DIR / "data" / "raw" / "quantify_telemetry.csv"


@pytest.fixture(scope="module")
def dataset():
    """Carga el dataset crudo una sola vez para todos los tests del modulo."""
    assert RAW_FILE.exists(), (
        f"El archivo de datos no existe en: {RAW_FILE}. "
        f"Ejecutar primero: python simulation/generate_dataset.py"
    )
    df = pd.read_csv(RAW_FILE)
    return df


# ============================================================================
# COLUMNAS ESPERADAS
# ============================================================================

EXPECTED_COLUMNS = [
    "usuario_id", "edad", "genero", "dispositivo",
    "dias_activo", "tasa_adherencia", "friccion_promedio",
    "racha_maxima", "frecuencia_fallo_semanal", "tendencia_crecimiento",
    "horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio",
    "nivel_estres", "riesgo_abandono"
]


# ============================================================================
# DS-001: VERIFICACION DE RANGOS NUMERICOS
# ============================================================================

class TestRangos:
    """Verifica que los valores numericos estan dentro de los rangos definidos
    en las reglas de simulacion (simulation_rules.md)."""

    RANGE_RULES = {
        "edad": (16, 65),
        "dias_activo": (0, 180),
        "tasa_adherencia": (0.0, 1.0),
        "friccion_promedio": (1.0, 10.0),
        "racha_maxima": (0, 180),
        "frecuencia_fallo_semanal": (0.0, 7.0),
        "tendencia_crecimiento": (-1.0, 1.0),
        "horas_sueno": (3.0, 10.0),
        "pasos_diarios": (500, 30000),
        "fc_media": (50, 115),  # Incluye outliers biometricos inyectados (Tipo 3)
        "spo2_promedio": (89, 100),
        "nivel_estres": (1, 5),
    }

    @pytest.mark.parametrize("columna, rango", list(RANGE_RULES.items()))
    def test_rango_columna(self, dataset, columna, rango):
        """Verifica que cada columna numerica esta dentro de su rango permitido."""
        min_val, max_val = rango
        col_data = dataset[columna].dropna()

        assert col_data.min() >= min_val, (
            f"{columna}: valor minimo {col_data.min()} esta por debajo del "
            f"limite inferior {min_val}"
        )
        assert col_data.max() <= max_val, (
            f"{columna}: valor maximo {col_data.max()} excede el "
            f"limite superior {max_val}"
        )


# ============================================================================
# DS-002: VERIFICACION DE VALORES NULOS CONTROLADOS
# ============================================================================

class TestNulos:
    """Verifica que los nulos existen solo en columnas biometricas y
    dentro del rango controlado (~2.5% por columna)."""

    BIOMETRIC_COLS = ["horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"]
    NON_NULLABLE_COLS = [
        "usuario_id", "edad", "genero", "dispositivo",
        "dias_activo", "tasa_adherencia", "friccion_promedio",
        "racha_maxima", "frecuencia_fallo_semanal", "tendencia_crecimiento",
        "nivel_estres", "riesgo_abandono"
    ]

    def test_nulos_en_biometricos_dentro_de_rango(self, dataset):
        """Los nulos en biometricos deben estar entre 1% y 5% por columna."""
        for col in self.BIOMETRIC_COLS:
            null_pct = dataset[col].isnull().mean() * 100
            assert 1.0 <= null_pct <= 5.0, (
                f"{col}: porcentaje de nulos ({null_pct:.1f}%) fuera del "
                f"rango esperado [1%, 5%]"
            )

    def test_sin_nulos_en_columnas_obligatorias(self, dataset):
        """Las columnas no biometricas no deben tener valores nulos."""
        for col in self.NON_NULLABLE_COLS:
            null_count = dataset[col].isnull().sum()
            assert null_count == 0, (
                f"{col}: tiene {null_count} valores nulos inesperados"
            )


# ============================================================================
# DS-003: VERIFICACION DE DUPLICADOS
# ============================================================================

class TestDuplicados:
    """Verifica la unicidad de los identificadores de usuario."""

    def test_sin_duplicados_en_usuario_id(self, dataset):
        """No debe haber IDs de usuario duplicados."""
        duplicados = dataset["usuario_id"].duplicated().sum()
        assert duplicados == 0, (
            f"Se encontraron {duplicados} IDs de usuario duplicados"
        )

    def test_sin_filas_completamente_duplicadas(self, dataset):
        """No debe haber filas identicas en todo el dataset."""
        duplicados = dataset.duplicated().sum()
        assert duplicados == 0, (
            f"Se encontraron {duplicados} filas completamente duplicadas"
        )


# ============================================================================
# DS-004: VERIFICACION DE INTEGRIDAD REFERENCIAL
# ============================================================================

class TestIntegridad:
    """Verifica la consistencia interna del dataset."""

    def test_formato_usuario_id(self, dataset):
        """Todos los IDs deben seguir el formato USR-XXXXX (5 digitos)."""
        patron = re.compile(r"^USR-\d{5}$")
        invalidos = dataset["usuario_id"].apply(lambda x: not patron.match(str(x)))
        n_invalidos = invalidos.sum()
        assert n_invalidos == 0, (
            f"{n_invalidos} IDs no cumplen el formato USR-XXXXX"
        )

    def test_total_registros(self, dataset):
        """El dataset debe contener exactamente 5000 registros."""
        assert len(dataset) == 5000, (
            f"Se esperaban 5000 registros, se encontraron {len(dataset)}"
        )

    def test_columnas_presentes(self, dataset):
        """Todas las columnas esperadas deben estar presentes."""
        for col in EXPECTED_COLUMNS:
            assert col in dataset.columns, (
                f"Columna faltante: {col}"
            )

    def test_no_columnas_extra(self, dataset):
        """No debe haber columnas inesperadas."""
        extras = set(dataset.columns) - set(EXPECTED_COLUMNS)
        assert len(extras) == 0, (
            f"Columnas inesperadas encontradas: {extras}"
        )


# ============================================================================
# DS-005: VERIFICACION DE DISTRIBUCION DE VARIABLE OBJETIVO
# ============================================================================

class TestDistribucion:
    """Verifica la distribucion de la variable objetivo riesgo_abandono."""

    def test_clases_presentes(self, dataset):
        """Las tres clases de riesgo deben estar presentes."""
        clases = set(dataset["riesgo_abandono"].unique())
        esperadas = {"Alto", "Medio", "Bajo"}
        assert clases == esperadas, (
            f"Clases encontradas: {clases}, esperadas: {esperadas}"
        )

    def test_distribucion_no_degenerada(self, dataset):
        """Ninguna clase debe tener mas del 80% de los registros."""
        max_pct = dataset["riesgo_abandono"].value_counts(normalize=True).max()
        assert max_pct < 0.80, (
            f"Distribucion degenerada: una clase tiene {max_pct*100:.1f}% "
            f"de los registros"
        )


# ============================================================================
# DS-006: VERIFICACION DE BALANCE DE CLASES
# ============================================================================

class TestBalance:
    """Verifica que el balance de clases es razonable para entrenamiento."""

    def test_clase_minima_supera_10_porciento(self, dataset):
        """Ninguna clase debe representar menos del 10% del total."""
        dist = dataset["riesgo_abandono"].value_counts(normalize=True)
        for clase, pct in dist.items():
            assert pct >= 0.10, (
                f"Clase '{clase}' representa solo {pct*100:.1f}%, "
                f"por debajo del minimo del 10%"
            )

    def test_conteo_por_clase(self, dataset):
        """Cada clase debe tener al menos 100 registros."""
        dist = dataset["riesgo_abandono"].value_counts()
        for clase, count in dist.items():
            assert count >= 100, (
                f"Clase '{clase}' tiene solo {count} registros"
            )


# ============================================================================
# DS-007: VERIFICACION DE TIPOS DE DATOS
# ============================================================================

class TestTipos:
    """Verifica que los tipos de datos son correctos para cada columna."""

    EXPECTED_TYPES = {
        "usuario_id": "object",       # string
        "edad": "int",
        "genero": "object",           # string categorico
        "dispositivo": "object",      # string categorico
        "dias_activo": "int",
        "tasa_adherencia": "float",
        "friccion_promedio": "float",
        "racha_maxima": "int",
        "frecuencia_fallo_semanal": "float",
        "tendencia_crecimiento": "float",
        "nivel_estres": "int",
        "riesgo_abandono": "object",  # string categorico
    }

    @pytest.mark.parametrize("columna, tipo_esperado", list(EXPECTED_TYPES.items()))
    def test_tipo_columna(self, dataset, columna, tipo_esperado):
        """Verifica que cada columna tiene el tipo de dato correcto."""
        dtype = str(dataset[columna].dtype)
        assert tipo_esperado in dtype, (
            f"{columna}: tipo actual '{dtype}', esperado contenga '{tipo_esperado}'"
        )

    def test_genero_valores_validos(self, dataset):
        """Los valores de genero solo pueden ser los definidos."""
        validos = {"Masculino", "Femenino", "No Binario"}
        actuales = set(dataset["genero"].unique())
        assert actuales.issubset(validos), (
            f"Valores de genero invalidos: {actuales - validos}"
        )

    def test_dispositivo_valores_validos(self, dataset):
        """Los valores de dispositivo solo pueden ser los definidos."""
        validos = {"Web", "Web+Smartwatch", "Smartwatch"}
        actuales = set(dataset["dispositivo"].unique())
        assert actuales.issubset(validos), (
            f"Valores de dispositivo invalidos: {actuales - validos}"
        )
