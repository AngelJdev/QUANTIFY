# 🍃 Logs de Hábitos — MongoDB / Mongoose

Este módulo almacena los **registros de cumplimiento de hábitos** utilizando MongoDB y Mongoose.

La decisión de utilizar MongoDB para los logs se debe a que estos registros tienen una **frecuencia de escritura considerablemente mayor** que la creación o modificación de usuarios y hábitos.

La información principal del sistema permanece en **MySQL**, mientras que MongoDB funciona como almacén especializado para el historial de seguimiento, métricas y estadísticas.

---

## 🏗️ Arquitectura

```text
                    ┌──────────────────┐
                    │     Frontend     │
                    │   Web / Mobile   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │ Node.js/Express  │
                    └───────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐            ┌──────────────┐
       │    MySQL     │            │   MongoDB    │
       │              │            │              │
       │ • Usuarios   │            │ • Logs       │
       │ • Hábitos    │            │ • Historial  │
       │ • Config.    │            │ • Métricas   │
       └──────────────┘            └──────────────┘
```
json
{
  "habito_id": {
    "type": "Number",
    "required": true,
    "index": true,
    "description": "ID relacional del hábito guardado en MySQL."
  },
  "usuario_id": {
    "type": "Number",
    "required": true,
    "index": true,
    "description": "Referencia al ID del usuario en MySQL para consultas más directas si es necesario."
  },
  "fecha_registro": {
    "type": "Date",
    "required": true,
    "description": "Fecha del log, sin considerar hora (YYYY-MM-DD)."
  },
  "completado": {
    "type": "Boolean",
    "default": false,
    "description": "True si es tipo booleano y cumplió, o si alcanzó meta."
  },
  "valor_registrado": {
    "type": "Number",
    "description": "Valor numérico (peso, minutos, cantidad) registrado. Nullable."
  },
  "notas": {
    "type": "String",
    "description": "Feedback cualitativo opcional."
  },
  "fecha_creacion": {
    "type": "Date",
    "default": "Date.now"
  }
}
```

## Índices Recomendados
- `{ "habito_id": 1, "fecha_registro": -1 }`: Optimizado para encontrar el último log de un hábito (útil para rachas) y consultas de rango temporal (Adherencia).
- `{ "usuario_id": 1 }`: Para métricas globales del usuario.


Cliente
   │
   ▼
Autenticación
   │
   ▼
Validar usuario ──────► MySQL
   │
   ▼
Validar hábito ───────► MySQL
   │
   ▼
Validar pertenencia
   │
   ▼
Validar datos
   │
   ▼
Guardar log ──────────► MongoDB
