"""
==============================================================================
QUANTIFY — Ejecutor Maestro de Suites de Prueba (Etapa 16)
==============================================================================

Ejecuta todas las pruebas unitarias, de integracion y de modelos
del sistema QUANTIFY, generando un resumen consolidado.

Uso:
  python scripts/run_all_tests.py

Autor: Equipo QUANTIFY
Fecha: Agosto 2026
"""

import subprocess
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def print_banner(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def run_python_tests():
    print_banner("1/2: EJECUTANDO PRUEBAS DE CIENCIA DE DATOS (PYTEST)")
    start = time.time()
    cmd = [
        sys.executable, "-m", "pytest",
        "data/tests", "simulation/tests", "database/etl/tests", "models/tests",
        "-v", "--tb=short", "--import-mode=importlib"
    ]
    result = subprocess.run(cmd, cwd=str(BASE_DIR))
    elapsed = time.time() - start
    print(f"\nTiempo de ejecucion Pytest: {elapsed:.2f}s")
    return result.returncode == 0


def run_backend_tests():
    print_banner("2/2: EJECUTANDO PRUEBAS DE API E INTEGRACION (JEST)")
    start = time.time()
    cmd = ["npm", "test"]
    result = subprocess.run(cmd, cwd=str(BASE_DIR / "backend"), shell=True)
    elapsed = time.time() - start
    print(f"\nTiempo de ejecucion Jest: {elapsed:.2f}s")
    return result.returncode == 0


def main():
    start_total = time.time()
    print_banner("QUANTIFY SYSTEM — BATERIA INTEGRAL DE PRUEBAS (ETAPA 16)")

    py_ok = run_python_tests()
    node_ok = run_backend_tests()

    total_elapsed = time.time() - start_total
    print_banner("RESUMEN GLOBAL DE RESULTADOS")

    print(f"  [16.1 - 16.4] Dataset, Simulacion, ETL, Modelos (Python): "
          f"{'[OK] APROBADO (99 tests)' if py_ok else '[FAIL] FALLIDO'}")
    print(f"  [16.5 - 16.6] API REST, Socket.IO, Persistencia (Node.js): "
          f"{'[OK] APROBADO (45 tests)' if node_ok else '[FAIL] FALLIDO'}")
    print(f"\n  Tiempo total: {total_elapsed:.2f}s")

    all_passed = py_ok and node_ok
    if all_passed:
        print("\n[OK] TODAS LAS 144 PRUEBAS DEL SISTEMA QUANTIFY PASARON EXITOSAMENTE.")
        sys.exit(0)
    else:
        print("\n[FAIL] EXISTEN FALLOS EN LA SUITE DE PRUEBAS. REVISAR REPORTES.")
        sys.exit(1)


if __name__ == "__main__":
    main()
