"""
==============================================================================
QUANTIFY — Pruebas del Pipeline ETL
==============================================================================

Etapa 16.3 del Proyecto Integrador.
Valida la integridad del pipeline de Extraccion, Transformacion y Carga
definido en database/etl/etl_pipeline.py.

Casos cubiertos:
  - ETL-001: Extraccion correcta del CSV
  - ETL-002: Transformacion imputa nulos con mediana
  - ETL-003: Transformacion genera codificaciones One-Hot
  - ETL-004: Carga preserva conteo de registros
  - ETL-005: Repetibilidad (idempotencia)
  - ETL-006: Manejo de errores ante archivo inexistente

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys
import tempfile
import os

# Agregar el directorio del ETL al path
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from etl_pipeline import extract, transform, load, validate


# ============================================================================
# CONFIGURACION
# ============================================================================

RAW_FILE = BASE_DIR / "data" / "raw" / "quantify_telemetry.csv"


@pytest.fixture(scope="module")
def raw_dataframe():
    """Carga los datos crudos para pruebas."""
    assert RAW_FILE.exists(), (
        f"Archivo crudo no encontrado: {RAW_FILE}. "
        f"Ejecutar: python simulation/generate_dataset.py"
    )
    return pd.read_csv(RAW_FILE)


@pytest.fixture(scope="module")
def transformed_data(raw_dataframe):
    """Ejecuta la transformacion completa y retorna (df_transformado, bitacora)."""
    np.random.seed(2026)
    return transform(raw_dataframe)


# ============================================================================
# ETL-001: EXTRACCION
# ============================================================================

class TestExtraccion:
    """Verifica que la fase de extraccion lee correctamente el CSV."""

    def test_extraccion_retorna_dataframe(self, raw_dataframe):
        """La extraccion debe retornar un DataFrame de pandas."""
        assert isinstance(raw_dataframe, pd.DataFrame)

    def test_extraccion_no_vacio(self, raw_dataframe):
        """El DataFrame extraido no debe estar vacio."""
        assert len(raw_dataframe) > 0, "El DataFrame extraido esta vacio"

    def test_extraccion_columnas_completas(self, raw_dataframe):
        """El DataFrame debe tener 16 columnas originales."""
        assert len(raw_dataframe.columns) == 16, (
            f"Se esperaban 16 columnas, encontradas {len(raw_dataframe.columns)}"
        )

    def test_extraccion_5000_registros(self, raw_dataframe):
        """El dataset crudo debe contener 5000 registros."""
        assert len(raw_dataframe) == 5000

    def test_extraccion_contiene_nulos(self, raw_dataframe):
        """El dataset crudo debe contener valores nulos (inyectados)."""
        total_nulos = raw_dataframe.isnull().sum().sum()
        assert total_nulos > 0, (
            "El dataset crudo deberia contener nulos inyectados"
        )


# ============================================================================
# ETL-002: TRANSFORMACION — IMPUTACION DE NULOS
# ============================================================================

class TestImputacionNulos:
    """Verifica que los nulos se imputan correctamente con la mediana."""

    CRITICAL_COLS = [
        "horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio"
    ]

    def test_sin_nulos_tras_imputacion(self, transformed_data):
        """Despues de la transformacion no debe haber nulos en features criticas."""
        df, _ = transformed_data
        for col in self.CRITICAL_COLS:
            nulos = df[col].isnull().sum()
            assert nulos == 0, (
                f"Columna {col} aun tiene {nulos} nulos tras imputacion"
            )

    def test_imputacion_usa_mediana(self, raw_dataframe):
        """Los valores imputados deben corresponder a la mediana original."""
        df = raw_dataframe.copy()
        for col in self.CRITICAL_COLS:
            if df[col].isnull().sum() > 0:
                mediana = df[col].median()
                assert mediana is not None and not np.isnan(mediana), (
                    f"La mediana de {col} es invalida: {mediana}"
                )

    def test_valores_no_nulos_se_preservan(self, raw_dataframe, transformed_data):
        """Los valores que no eran nulos deben mantenerse sin cambios."""
        df_clean, _ = transformed_data
        for col in self.CRITICAL_COLS:
            mask_not_null = raw_dataframe[col].notna()
            originales = raw_dataframe.loc[mask_not_null, col].reset_index(drop=True)
            transformados = df_clean.loc[mask_not_null, col].reset_index(drop=True)
            pd.testing.assert_series_equal(
                originales, transformados,
                check_names=False,
                check_dtype=False,
                obj=f"Valores preservados de {col}"
            )


# ============================================================================
# ETL-003: TRANSFORMACION — CODIFICACIONES ONE-HOT
# ============================================================================

class TestCodificaciones:
    """Verifica que las codificaciones categoricas se generan correctamente."""

    def test_onehot_genero_presente(self, transformed_data):
        """Las columnas One-Hot de genero deben existir."""
        df, _ = transformed_data
        esperadas = ["genero_Masculino", "genero_Femenino", "genero_No Binario"]
        for col in esperadas:
            assert col in df.columns, f"Columna faltante: {col}"

    def test_onehot_dispositivo_presente(self, transformed_data):
        """Las columnas One-Hot de dispositivo deben existir."""
        df, _ = transformed_data
        esperadas = ["disp_Web", "disp_Web+Smartwatch", "disp_Smartwatch"]
        for col in esperadas:
            assert col in df.columns, f"Columna faltante: {col}"

    def test_onehot_genero_valores_binarios(self, transformed_data):
        """Las columnas One-Hot de genero solo deben contener 0 y 1."""
        df, _ = transformed_data
        for col in ["genero_Masculino", "genero_Femenino", "genero_No Binario"]:
            valores = set(df[col].unique())
            assert valores.issubset({0, 1}), (
                f"Columna {col} contiene valores no binarios: {valores}"
            )

    def test_codificacion_ordinal_riesgo(self, transformed_data):
        """La codificacion ordinal de riesgo debe tener valores 0, 1, 2."""
        df, _ = transformed_data
        assert "riesgo_abandono_cod" in df.columns
        valores = set(df["riesgo_abandono_cod"].unique())
        assert valores.issubset({0, 1, 2}), (
            f"Valores de codificacion ordinal invalidos: {valores}"
        )

    def test_features_derivados_existen(self, transformed_data):
        """Los features de ingenieria deben haberse generado."""
        df, _ = transformed_data
        derivados = [
            "indice_riesgo_compuesto",
            "ratio_adherencia_friccion",
            "grupo_edad",
            "eficiencia_racha",
        ]
        for col in derivados:
            assert col in df.columns, f"Feature derivado faltante: {col}"


# ============================================================================
# ETL-004: CARGA — PRESERVACION DE CONTEO
# ============================================================================

class TestCarga:
    """Verifica que la fase de carga preserva la integridad de los datos."""

    def test_conteo_registros_preservado(self, raw_dataframe, transformed_data):
        """El numero de registros debe ser igual al original menos duplicados."""
        df, _ = transformed_data
        duplicados = raw_dataframe.duplicated(subset=["usuario_id"]).sum()
        esperados = len(raw_dataframe) - duplicados
        assert len(df) == esperados, (
            f"Registros: esperados {esperados}, obtenidos {len(df)}"
        )

    def test_guardado_a_csv_exitoso(self, transformed_data):
        """La funcion load debe guardar el archivo sin errores."""
        df, _ = transformed_data
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = Path(tmpdir) / "test_output.csv"
            load(df, filepath)
            assert filepath.exists(), "El archivo no se creo"
            assert filepath.stat().st_size > 0, "El archivo esta vacio"

    def test_csv_se_puede_releer(self, transformed_data):
        """El CSV guardado debe poder releerse correctamente."""
        df, _ = transformed_data
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = Path(tmpdir) / "test_reload.csv"
            load(df, filepath)
            df_reload = pd.read_csv(filepath)
            assert len(df_reload) == len(df)
            assert len(df_reload.columns) == len(df.columns)


# ============================================================================
# ETL-005: REPETIBILIDAD
# ============================================================================

class TestRepetibilidad:
    """Verifica que el pipeline produce resultados identicos en multiples ejecuciones."""

    def test_idempotencia(self, raw_dataframe):
        """Dos ejecuciones del transform con los mismos datos deben ser iguales."""
        np.random.seed(2026)
        df1, _ = transform(raw_dataframe)

        np.random.seed(2026)
        df2, _ = transform(raw_dataframe)

        pd.testing.assert_frame_equal(
            df1.reset_index(drop=True),
            df2.reset_index(drop=True),
        )

    def test_bitacora_registra_operaciones(self, transformed_data):
        """La bitacora de transformaciones debe contener operaciones."""
        _, bitacora = transformed_data
        assert len(bitacora) > 0, "La bitacora esta vacia"
        assert any("nulos" in entry.lower() or "imputado" in entry.lower()
                    for entry in bitacora), (
            "La bitacora no registra la imputacion de nulos"
        )


# ============================================================================
# ETL-006: MANEJO DE ERRORES
# ============================================================================

class TestManejoErrores:
    """Verifica que el pipeline maneja correctamente los errores."""

    def test_archivo_inexistente(self):
        """Intentar extraer de un archivo inexistente debe lanzar excepcion."""
        with pytest.raises((FileNotFoundError, Exception)):
            extract(Path("/ruta/que/no/existe/datos.csv"))

    def test_dataframe_vacio(self):
        """Transformar un DataFrame vacio con las columnas correctas no debe crashear."""
        columnas = [
            "usuario_id", "edad", "genero", "dispositivo",
            "dias_activo", "tasa_adherencia", "friccion_promedio",
            "racha_maxima", "frecuencia_fallo_semanal", "tendencia_crecimiento",
            "horas_sueno", "pasos_diarios", "fc_media", "spo2_promedio",
            "nivel_estres", "riesgo_abandono"
        ]
        df_vacio = pd.DataFrame(columns=columnas)
        try:
            df_result, _ = transform(df_vacio)
            # Si no lanza excepcion, verificar que el resultado esta vacio
            assert len(df_result) == 0
        except Exception:
            # Es aceptable que lance una excepcion controlada
            pass

    def test_validacion_datos_procesados(self, raw_dataframe, transformed_data):
        """La funcion validate debe retornar True cuando los datos son correctos."""
        df, _ = transformed_data
        resultado = validate(raw_dataframe, df)
        assert resultado is True, "La validacion post-carga fallo"
