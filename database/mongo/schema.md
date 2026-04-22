# 🍃 Mongoose Schema Definition: `logs`

Este schema está diseñado para alojarse en MongoDB, debido a que el registro de los logs de los hábitos ocurre con mucha más frecuencia que la creación/edición de usuarios y hábitos.

```json
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
