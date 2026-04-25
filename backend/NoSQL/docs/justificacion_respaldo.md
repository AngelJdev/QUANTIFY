# Justificación del Respaldo Automatizado — MongoDB

## ¿Por qué automatizar los respaldos en NoSQL?

### 1. Naturaleza Schemaless de MongoDB

MongoDB no impone un esquema rígido a nivel motor. Cualquier documento puede ser insertado con campos adicionales o con tipos de datos inconsistentes sin que el motor lo rechace. Esto significa que:

- **Errores de código** pueden insertar documentos con estructura incorrecta sin generar errores.
- **Migraciones** no son atómicas: un cambio en el modelo Mongoose no afecta documentos ya existentes.
- **Datos corruptos** pueden pasar desapercibidos hasta que se consultan.

Un respaldo automatizado periódico permite **restaurar a un estado consistente conocido** en caso de corrupción silenciosa.

---

### 2. Sincronización Híbrida SQL ↔ NoSQL

En Quantify, MongoDB opera como **espejo** de MySQL. La sincronización se realiza mediante hooks de Sequelize (`afterCreate`, `afterUpdate`, `afterDestroy`). Sin embargo:

- Si un hook falla (por timeout de red, caída temporal de Atlas, etc.), **los datos quedan desincronizados** sin que el usuario lo note.
- `bulkCreate` con `hooks: false` (usado en la población masiva) **no ejecuta hooks**, por lo que la sincronización se hace manualmente y podría fallar parcialmente.
- No existe un mecanismo nativo de reconciliación automática entre MySQL y MongoDB.

Los respaldos automáticos garantizan un **punto de recuperación** cuando la sincronización se rompe.

---

### 3. MongoDB Atlas y Disponibilidad

Aunque MongoDB Atlas ofrece respaldos nativos en sus planes pagados, el plan gratuito (M0 Shared) utilizado en este proyecto **no incluye respaldos automáticos continuos**. Por lo tanto:

- No hay snapshots automáticos en el tier gratuito.
- Un fallo en el cluster podría resultar en **pérdida total de datos** sin respaldo local.
- El script automatizado complementa las limitaciones del plan actual.

---

### 4. Operaciones de Población Masiva

El sistema incluye endpoints de población masiva que pueden insertar cientos o miles de registros de prueba. Estas operaciones:

- Pueden dejar datos huérfanos si fallan a mitad de ejecución.
- El endpoint `DELETE` de limpieza podría eliminar datos legítimos si los filtros fallan.
- Un respaldo previo a las pruebas de carga permite **rollback seguro**.

---

## Configuración del Script

| Parámetro | Valor Default | Descripción |
|-----------|---------------|-------------|
| `CRON_SCHEDULE` | `0 */6 * * *` | Cada 6 horas |
| `MAX_BACKUPS` | `10` | Respaldos automáticos máximos almacenados |
| `BACKUP_BASE_DIR` | `NoSQL/backups/` | Directorio de almacenamiento |

### Frecuencias Recomendadas

| Escenario | Cron | Frecuencia |
|-----------|------|------------|
| Desarrollo activo | `0 */6 * * *` | Cada 6 horas |
| Pre-producción | `0 */12 * * *` | Cada 12 horas |
| Producción | `0 0 * * *` | Diario a medianoche |
| Antes de pruebas de carga | Manual | Usar `backup_completo.bat` |

---

## Requisitos

1. **MongoDB Database Tools** instalado (`mongodump` en PATH)
   - Descargar: https://www.mongodb.com/try/download/database-tools
2. **node-cron** instalado: `npm install node-cron`
3. Archivo `.env` con `MONGO_URI` configurado

## Ejecución

```bash
# Iniciar servicio de respaldo automatizado
node backend/NoSQL/scripts/backup_automatizado.js
```

El script ejecuta un respaldo inmediato al iniciar y luego programa los siguientes según `CRON_SCHEDULE`.
