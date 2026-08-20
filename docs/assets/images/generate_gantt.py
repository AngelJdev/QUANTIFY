# -*- coding: utf-8 -*-
"""
QUANTIFY — Diagrama de Gantt (Engineering Aesthetic)
Genera un PNG de alta resolución con el cronograma completo del proyecto.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
from datetime import date
import os

# ---------------------------------------------------------------------------
# 1. PALETA — "Engineering Aesthetic" (fondo oscuro técnico)
# ---------------------------------------------------------------------------
BG          = "#0b0f14"   # fondo general
PANEL       = "#10161d"   # fondo del área de trazado
GRID        = "#22303c"
TEXT_MAIN   = "#e6edf3"
TEXT_DIM    = "#7d8a97"
ACCENT      = "#00d4ff"

OWNER_COLOR = {
    "Ángel de Jesús B.": "#00d4ff",   # Tech Lead / Arquitecto -> cian
    "Francisco García":  "#a970ff",   # Data Scientist -> violeta
    "Al Farias":         "#00ffab",   # Frontend -> verde menta
    "Brian Jesús M.":    "#ff9f1c",   # Backend -> naranja
    "Alejandro Artiaga": "#ff4d6d",   # Data Eng / QA -> rojo-rosa
}

PHASE_BAND_COLOR = {
    "FASE 1: Planeación y Arquitectura": "#12202b",
    "FASE 2: Ingeniería de Datos":       "#121f18",
    "FASE 3: Inteligencia Artificial":   "#1c1526",
    "FASE 4: Core & Frontend":           "#241a12",
    "FASE 5: Pruebas y Cierre":          "#241318",
}

# ---------------------------------------------------------------------------
# 2. DATOS DEL PROYECTO
# ---------------------------------------------------------------------------
tasks = [
    ("FASE 1: Planeación y Arquitectura", "CRISP-DM y planteamiento del problema", date(2026, 3, 2), date(2026, 3, 9), "Ángel de Jesús B.", False),
    ("FASE 1: Planeación y Arquitectura", "Diseño de arquitectura híbrida (Web + WearOS)", date(2026, 3, 9), date(2026, 3, 20), "Ángel de Jesús B.", False),
    ("FASE 1: Planeación y Arquitectura", "Diseño de modelo relacional MySQL", date(2026, 3, 16), date(2026, 3, 27), "Ángel de Jesús B.", False),
    ("FASE 1: Planeación y Arquitectura", "Setup de repositorios y CI/CD", date(2026, 3, 11), date(2026, 3, 23), "Brian Jesús M.", False),

    ("FASE 2: Ingeniería de Datos", "Script simulador masivo (300,000 logs)", date(2026, 4, 1), date(2026, 4, 22), "Alejandro Artiaga", False),
    ("FASE 2: Ingeniería de Datos", "Diseño de tuberías ETL", date(2026, 4, 15), date(2026, 5, 6), "Alejandro Artiaga", False),
    ("FASE 2: Ingeniería de Datos", "Limpieza y transformación de datos", date(2026, 5, 4), date(2026, 5, 18), "Alejandro Artiaga", False),
    ("FASE 2: Ingeniería de Datos", "Carga de tabla de hechos — Star Schema", date(2026, 5, 11), date(2026, 5, 29), ("Alejandro Artiaga", "Ángel de Jesús B."), True),

    ("FASE 3: Inteligencia Artificial", "Análisis Exploratorio de Datos (EDA)", date(2026, 6, 1), date(2026, 6, 15), "Francisco García", False),
    ("FASE 3: Inteligencia Artificial", "Clustering K-Means (perfiles de constancia)", date(2026, 6, 12), date(2026, 6, 26), "Francisco García", False),
    ("FASE 3: Inteligencia Artificial", "Entrenamiento modelo Burnout (supervisado)", date(2026, 6, 22), date(2026, 7, 17), "Francisco García", False),
    ("FASE 3: Inteligencia Artificial", "Validación cruzada y tuning", date(2026, 7, 13), date(2026, 7, 24), "Francisco García", False),
    ("FASE 3: Inteligencia Artificial", "Empaquetado de modelos (Joblib) y API de inferencia", date(2026, 7, 20), date(2026, 8, 3), ("Francisco García", "Brian Jesús M."), True),

    ("FASE 4: Core & Frontend", "Desarrollo de APIs Core (Node.js)", date(2026, 5, 4), date(2026, 6, 26), "Brian Jesús M.", False),
    ("FASE 4: Core & Frontend", "Integración WebSockets en tiempo real", date(2026, 6, 15), date(2026, 7, 10), "Brian Jesús M.", False),
    ("FASE 4: Core & Frontend", "Dashboard React (Engineering Aesthetic UI)", date(2026, 5, 18), date(2026, 7, 17), "Al Farias", False),
    ("FASE 4: Core & Frontend", "Integración biométrica en tiempo real (frontend)", date(2026, 7, 6), date(2026, 7, 28), "Al Farias", False),
    ("FASE 4: Core & Frontend", "App WearOS (Kotlin / Wear)", date(2026, 7, 13), date(2026, 8, 11), "Al Farias", False),
    ("FASE 4: Core & Frontend", "Integración WearOS ↔ Backend", date(2026, 8, 3), date(2026, 8, 17), ("Brian Jesús M.", "Al Farias"), True),

    ("FASE 5: Pruebas y Cierre", "Pruebas de estrés volumétrico (300K logs)", date(2026, 8, 5), date(2026, 8, 19), "Alejandro Artiaga", False),
    ("FASE 5: Pruebas y Cierre", "QA funcional integral", date(2026, 8, 17), date(2026, 8, 24), "Alejandro Artiaga", False),
    ("FASE 5: Pruebas y Cierre", "Consolidación documental definitiva", date(2026, 8, 21), date(2026, 8, 28), "Ángel de Jesús B.", False),
    ("FASE 5: Pruebas y Cierre", "Despliegue y entrega final", date(2026, 8, 27), date(2026, 8, 31), ("Ángel de Jesús B.", "Francisco García"), True),
]

TODAY = date(2026, 8, 20)

# ---------------------------------------------------------------------------
# 3. PREPARACIÓN DE FILAS
# ---------------------------------------------------------------------------
rows = list(reversed(tasks))
n = len(rows)

fig, ax = plt.subplots(figsize=(18, 0.5 * n + 3.2), dpi=200)
fig.patch.set_facecolor(BG)
ax.set_facecolor(PANEL)

bar_h = 0.62
phase_bounds = {}
for i, (phase, *_rest) in enumerate(rows):
    phase_bounds.setdefault(phase, [i, i])
    phase_bounds[phase][1] = i

xmin = mdates.date2num(date(2026, 2, 15))
xmax = mdates.date2num(date(2026, 9, 8))

for phase, (i0, i1) in phase_bounds.items():
    ax.axhspan(i0 - 0.5, i1 + 0.5, color=PHASE_BAND_COLOR[phase], zorder=0)

# ---------------------------------------------------------------------------
# 4. BARRAS DE TAREAS
# ---------------------------------------------------------------------------
for i, (phase, name, start, end, owner, milestone) in enumerate(rows):
    x0 = mdates.date2num(start)
    x1 = mdates.date2num(end)
    width = x1 - x0

    if isinstance(owner, tuple):
        c1, c2 = OWNER_COLOR[owner[0]], OWNER_COLOR[owner[1]]
        half = bar_h / 2
        ax.barh(i + 0.005, width, left=x0, height=half, align="edge", color=c1, edgecolor="none", zorder=3)
        ax.barh(i - half - 0.005, width, left=x0, height=half, align="edge", color=c2, edgecolor="none", zorder=3)
    else:
        ax.barh(i, width, left=x0, height=bar_h, align="center", color=OWNER_COLOR[owner], edgecolor="none", zorder=3)

    rect = mpatches.Rectangle((x0, i - bar_h / 2), width, bar_h, fill=False, linewidth=0.8, edgecolor="#000000", alpha=0.35, zorder=4)
    ax.add_patch(rect)

    if milestone:
        ax.plot(x1, i, marker="D", markersize=8, markerfacecolor=ACCENT, markeredgecolor="#ffffff", markeredgewidth=1.1, zorder=6)

    dur = (end - start).days
    text_offset = 3.2 if milestone else 1.2
    ax.text(x1 + text_offset, i, f"{dur}d", va="center", ha="left", fontsize=8, color=TEXT_DIM, family="monospace", zorder=6)

# ---------------------------------------------------------------------------
# 5. EJES, GRID Y ETIQUETAS
# ---------------------------------------------------------------------------
ax.set_yticks(range(n))
ax.set_yticklabels([r[1] for r in rows], fontsize=9.5, color=TEXT_MAIN, family="monospace")
ax.set_ylim(-0.7, n - 0.3)
ax.set_xlim(xmin, xmax)

ax.xaxis_date()
ax.xaxis.set_major_locator(mdates.MonthLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
ax.xaxis.set_minor_locator(mdates.WeekdayLocator(byweekday=0))

# Se añadió rotation=45 para prevenir que se encimen las fechas y rotarlas elegantemente
ax.tick_params(axis="x", colors=TEXT_MAIN, labelsize=10, top=True, labeltop=True, bottom=True, labelbottom=True, rotation=45)

ax.tick_params(axis="y", colors=TEXT_MAIN, length=0)

for spine in ax.spines.values():
    spine.set_visible(False)

ax.grid(axis="x", which="major", color=GRID, linewidth=1.0, zorder=1)
ax.grid(axis="x", which="minor", color=GRID, linewidth=0.4, alpha=0.5, zorder=1)

today_x = mdates.date2num(TODAY)
ax.axvline(today_x, color="#ff3860", linewidth=1.6, linestyle="--", zorder=7)
ax.text(today_x - 0.8, n - 0.75, "HOY · 20 AGO 2026", color="#ff3860", fontsize=8.5, fontweight="bold", family="monospace", va="top", ha="right", rotation=90, zorder=7)

for phase, (i0, i1) in phase_bounds.items():
    mid = (i0 + i1) / 2
    ax.text(xmin - 4.5, mid, phase.split(":")[0], rotation=90, va="center", ha="center", fontsize=9.5, fontweight="bold", color=TEXT_DIM, family="monospace")

# ---------------------------------------------------------------------------
# 6. TÍTULO Y EXPORTACIÓN
# ---------------------------------------------------------------------------
fig.text(0.045, 0.975, "QUANTIFY", fontsize=26, fontweight="bold", color=TEXT_MAIN, family="monospace")
fig.text(0.045, 0.955, "Plataforma híbrida Web + WearOS de seguimiento de hábitos con detección anti-falseo\n"
         "y predicción de burnout (ML) — Cronograma general del proyecto · Marzo – Agosto 2026", fontsize=10.5, color=TEXT_DIM, family="monospace")

legend_handles = [mpatches.Patch(color=c, label=owner) for owner, c in OWNER_COLOR.items()]
legend_handles.append(mpatches.Patch(facecolor="none", edgecolor="none", label=""))
legend_handles.append(plt.Line2D([0], [0], marker="D", color="none", markerfacecolor=ACCENT, markeredgecolor="#ffffff", markersize=8, label="Hito / Entregable clave"))
leg = ax.legend(handles=legend_handles, loc="upper center", bbox_to_anchor=(0.5, -0.045), ncol=6, frameon=False, fontsize=9, labelcolor=TEXT_MAIN, handletextpad=0.6, columnspacing=1.4)

fig.text(0.045, 0.012, "Stack: MySQL (transaccional) · MongoDB (analítica volumétrica) · Python/Joblib (ML) · Node.js · React · WebSockets · WearOS", fontsize=8.3, color=TEXT_DIM, family="monospace")
fig.text(0.955, 0.012, "v1.0 — Generado dinámicamente", fontsize=8.3, color=TEXT_DIM, family="monospace", ha="right")

output_path = os.path.join("docs", "assets", "images", "quantify_gantt_2026.png")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
plt.subplots_adjust(left=0.285, right=0.955, top=0.90, bottom=0.10)
plt.savefig(output_path, facecolor=BG, dpi=220)
print(f"Diagrama generado: {output_path}")
