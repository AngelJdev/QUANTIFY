# 🍃 Logs de Hábitos — MongoDB / Mongoose

Este módulo almacena los **registros de cumplimiento de hábitos** utilizando MongoDB y Mongoose.

La decisión de utilizar MongoDB para los logs se debe a que estos registros tienen una **frecuencia de escritura considerablemente mayor** que la creación o modificación de usuarios y hábitos.

La información principal del sistema permanece en **MySQL**, mientras que MongoDB funciona como almacén especializado para el historial de seguimiento, métricas y estadísticas.

---

## 🎯 Objetivo

El objetivo de la colección `logs` es almacenar de manera eficiente el historial de actividad de los hábitos realizados por los usuarios.

Estos registros permiten generar posteriormente información como:

- Cumplimiento de hábitos.
- Rachas.
- Porcentaje de adherencia.
- Estadísticas semanales.
- Estadísticas mensuales.
- Evolución del usuario.
- Valores registrados.
- Historial de actividad.

La separación de responsabilidades entre MySQL y MongoDB permite mantener en MySQL la información estructural del sistema y utilizar MongoDB para manejar el alto volumen de registros generado por el seguimiento de hábitos.

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

### Responsabilidades de MySQL

MySQL almacena la información estructural y relacional principal del sistema:

- Usuarios.
- Hábitos.
- Configuración de hábitos.
- Relaciones entre usuarios y hábitos.
- Información principal de las entidades.

### Responsabilidades de MongoDB

MongoDB almacena información relacionada con el seguimiento:

- Logs de hábitos.
- Historial de cumplimiento.
- Valores registrados.
- Notas.
- Información para métricas.
- Información para estadísticas.
- Datos necesarios para calcular rachas.

> MongoDB no almacena una copia completa de los usuarios ni de los hábitos. Los campos `usuario_id` y `habito_id` funcionan como referencias lógicas hacia los registros existentes en MySQL.

---

## 📦 Estructura del documento

Cada documento de la colección `logs` representa un registro de actividad de un hábito.

### Ejemplo

```json
{
  "habito_id": 15,
  "usuario_id": 42,
  "fecha_registro": "2026-08-18T00:00:00.000Z",
  "completado": true,
  "valor_registrado": 30,
  "notas": "Realicé 30 minutos de ejercicio.",
  "fecha_creacion": "2026-08-18T14:30:00.000Z"
}
```

---

## 📋 Definición de campos

| Campo | Tipo | Requerido | Índice | Descripción |
|---|---|---|---|---|
| `habito_id` | Number | Sí | Sí | ID relacional del hábito almacenado en MySQL. |
| `usuario_id` | Number | Sí | Sí | ID relacional del usuario almacenado en MySQL. |
| `fecha_registro` | Date | Sí | Sí | Fecha correspondiente al registro del hábito. |
| `completado` | Boolean | No | No | Indica si el hábito fue cumplido. |
| `valor_registrado` | Number | No | No | Valor numérico registrado, por ejemplo peso, minutos o cantidad. |
| `notas` | String | No | No | Comentario o feedback cualitativo opcional. |
| `fecha_creacion` | Date | No | No | Fecha y hora en que se creó el documento. |

---

## 🧩 Schema de Mongoose

```javascript
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    habito_id: {
      type: Number,
      required: true,
      index: true
    },

    usuario_id: {
      type: Number,
      required: true,
      index: true
    },

    fecha_registro: {
      type: Date,
      required: true
    },

    completado: {
      type: Boolean,
      default: false
    },

    valor_registrado: {
      type: Number,
      default: null
    },

    notas: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    },

    fecha_creacion: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'logs',
    versionKey: false
  }
);

// Historial de un hábito ordenado por fecha
logSchema.index({
  habito_id: 1,
  fecha_registro: -1
});

// Historial y métricas de un usuario
logSchema.index({
  usuario_id: 1,
  fecha_registro: -1
});

export default mongoose.model('Log', logSchema);
```

---

## 🔎 Índices recomendados

Debido a que la colección `logs` puede crecer rápidamente, es importante definir índices para las consultas más frecuentes.

### 1. Historial de un hábito

```javascript
{
  habito_id: 1,
  fecha_registro: -1
}
```

Este índice permite:

- Obtener el último registro.
- Consultar el historial.
- Calcular rachas.
- Realizar consultas por período.
- Analizar la adherencia.

### 2. Historial y métricas del usuario

```javascript
{
  usuario_id: 1,
  fecha_registro: -1
}
```

Este índice permite:

- Obtener todos los logs del usuario.
- Consultar registros recientes.
- Generar estadísticas.
- Obtener métricas semanales.
- Obtener métricas mensuales.
- Analizar la evolución del usuario.

---

## 🚫 Prevención de registros duplicados

Si la lógica del sistema establece que solamente puede existir **un registro por hábito y día**, se puede utilizar un índice único:

```javascript
logSchema.index(
  {
    habito_id: 1,
    fecha_registro: 1
  },
  {
    unique: true
  }
);
```

Esto evita situaciones como:

```text
Hábito #15

18/08/2026 → Registro 1 ✅
18/08/2026 → Registro 2 ❌
```

> Si QUANTIFY permite múltiples registros durante el mismo día, este índice no debe ser único.

Por ejemplo:

```text
08:00 → 10 minutos
13:00 → 15 minutos
19:00 → 20 minutos
```

---

## 🔐 Integridad entre MySQL y MongoDB

MongoDB no puede utilizar una `FOREIGN KEY` tradicional hacia MySQL.

Por lo tanto, la integridad de los datos debe ser validada por el backend.

Antes de crear un log se debe verificar:

1. Que el usuario exista.
2. Que el hábito exista.
3. Que el hábito pertenezca al usuario.
4. Que el usuario esté autenticado.
5. Que los datos recibidos sean válidos.
6. Que el registro cumpla las reglas de negocio.

---

## 🔄 Flujo de validación

```text
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
Verificar duplicados
   │
   ▼
Guardar log ──────────► MongoDB
```

---

## 🔎 Consultas frecuentes

### Obtener el último log de un hábito

```javascript
const ultimoLog = await Log.findOne({
  habito_id: 15
}).sort({
  fecha_registro: -1
});
```

### Obtener los logs de un usuario

```javascript
const logs = await Log.find({
  usuario_id: 42
}).sort({
  fecha_registro: -1
});
```

### Obtener los logs de un hábito

```javascript
const logs = await Log.find({
  habito_id: 15
}).sort({
  fecha_registro: -1
});
```

### Obtener logs de un período

```javascript
const logs = await Log.find({
  usuario_id: 42,
  fecha_registro: {
    $gte: new Date('2026-08-01'),
    $lt: new Date('2026-09-01')
  }
}).sort({
  fecha_registro: 1
});
```

---

## 🔥 Cálculo de rachas

Los logs permiten calcular las rachas de cumplimiento de los hábitos.

Ejemplo:

```text
15/08 → ✅
16/08 → ✅
17/08 → ✅
18/08 → ✅
19/08 → ❌
```

Resultado:

```text
Racha actual: 4 días
```

Los registros deben obtenerse ordenados por `fecha_registro` para calcular correctamente:

- Racha actual.
- Mejor racha.
- Días consecutivos cumplidos.
- Días consecutivos incumplidos.

---

## 📈 Métricas

A partir de la colección `logs` se pueden generar métricas como:

- Porcentaje de adherencia.
- Racha actual.
- Mejor racha.
- Total de hábitos completados.
- Total de hábitos incumplidos.
- Promedio de valores registrados.
- Cumplimiento diario.
- Cumplimiento semanal.
- Cumplimiento mensual.
- Evolución del usuario.
- Comparación entre períodos.

Ejemplo:

```text
Usuario #42

Cumplimiento: 82%
Racha actual: 7 días
Mejor racha: 21 días
Total de logs: 156
```

---

## 🛡️ Seguridad y protección contra bots

Debido a que los logs pueden generarse con una alta frecuencia, el endpoint encargado de crearlos debe contar con mecanismos de protección.

Se recomienda implementar:

- Autenticación.
- Autorización.
- Rate limiting.
- Validación de datos.
- Validación de `habito_id`.
- Validación de `usuario_id`.
- Validación de propiedad del hábito.
- Límite de longitud para `notas`.
- Validación de valores numéricos.
- Prevención de duplicados.
- Protección contra bots.
- Registro de actividad sospechosa.

### Flujo recomendado

```text
Cliente
   │
   ▼
Rate Limiting
   │
   ▼
Autenticación
   │
   ▼
Autorización
   │
   ▼
Validación
   │
   ▼
MySQL
   │
   ▼
MongoDB
```

Esto evita que un cliente malicioso pueda generar grandes cantidades de registros falsos.

---

## 🕐 Manejo de fechas

Se recomienda utilizar el tipo `Date` de MongoDB:

```javascript
fecha_registro: {
  type: Date,
  required: true
}
```

La aplicación debe establecer una política consistente para las zonas horarias.

Se recomienda:

- Almacenar fechas en UTC.
- Normalizar las fechas antes de guardarlas.
- Convertir las fechas a la zona horaria del usuario al mostrarlas.
- Utilizar la misma estrategia en todo el backend.

Esto es importante para evitar errores en:

- Rachas.
- Estadísticas diarias.
- Estadísticas semanales.
- Estadísticas mensuales.
- Comparaciones entre fechas.

---

## 📄 Paginación

Debido al crecimiento de la colección, no se recomienda devolver todos los logs de un usuario en una sola petición.

Ejemplo:

```javascript
const page = 1;
const limit = 20;

const logs = await Log.find({
  usuario_id: 42
})
.sort({
  fecha_registro: -1
})
.skip((page - 1) * limit)
.limit(limit);
```

Esto reduce el consumo de memoria y mejora el rendimiento del backend y frontend.

---

## 📦 Crecimiento de la colección

Los logs pueden convertirse en una de las colecciones con mayor crecimiento del sistema.

Por ejemplo:

```text
100 usuarios
× 5 hábitos
× 365 días
----------------
182,500 logs/año
```

Con 1,000 usuarios:

```text
1,000 usuarios
× 5 hábitos
× 365 días
----------------
1,825,000 logs/año
```

Por esta razón se deben considerar:

- Índices.
- Paginación.
- Consultas optimizadas.
- Monitoreo de la colección.
- Políticas de retención.
- Archivado de información antigua.
- Optimización de consultas.

---

## ⚠️ Códigos HTTP recomendados

| Situación | Código |
|---|---:|
| Registro creado correctamente | `201 Created` |
| Consulta exitosa | `200 OK` |
| Datos inválidos | `400 Bad Request` |
| Usuario no autenticado | `401 Unauthorized` |
| Usuario sin permisos | `403 Forbidden` |
| Hábito inexistente | `404 Not Found` |
| Registro duplicado | `409 Conflict` |
| Demasiadas solicitudes | `429 Too Many Requests` |
| Error interno | `500 Internal Server Error` |

---

## 🗂️ Estructura recomendada

```text
backend/
├── models/
│   └── Log.js
│
├── controllers/
│   └── logController.js
│
├── routes/
│   └── logRoutes.js
│
├── services/
│   └── logService.js
│
└── middlewares/
    ├── auth.js
    ├── rateLimiter.js
    └── validation.js
```

---

## 🔄 Relación MySQL ↔ MongoDB

```text
MySQL
┌─────────────────────┐
│ users               │
│                     │
│ id = 42             │
└──────────┬──────────┘
           │
           │ usuario_id
           ▼
MongoDB
┌─────────────────────┐
│ logs                │
│                     │
│ usuario_id = 42     │
│ habito_id = 15      │
└──────────┬──────────┘
           │
           │ habito_id
           ▼
MySQL
┌─────────────────────┐
│ habits              │
│                     │
│ id = 15             │
│ usuario_id = 42     │
└─────────────────────┘
```

La relación es lógica y debe ser validada por el backend.

---

## ⚠️ Manejo de errores

El backend debe manejar correctamente los errores relacionados con la creación y consulta de logs.

| Situación | Respuesta |
|---|---|
| Usuario no autenticado | `401 Unauthorized` |
| Usuario sin permisos | `403 Forbidden` |
| Hábito inexistente | `404 Not Found` |
| Hábito no pertenece al usuario | `403 Forbidden` |
| Datos inválidos | `400 Bad Request` |
| Registro duplicado | `409 Conflict` |
| Límite de peticiones excedido | `429 Too Many Requests` |
| Error interno de MongoDB | `500 Internal Server Error` |

Los errores internos de MongoDB no deben exponerse directamente al cliente.

---

## 🔄 Flujo completo de creación de un log

```text
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ POST /logs
       ▼
┌────────────────────┐
│ Rate Limiting      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Autenticación      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Validación         │
│ de datos           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Validar usuario    │
│ en MySQL           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Validar hábito     │
│ en MySQL           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Validar propiedad  │
│ del hábito         │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Verificar reglas   │
│ de duplicidad      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│      MongoDB       │
│       logs         │
└────────────────────┘
```

---

## ✅ Reglas principales

1. `usuario_id` debe corresponder a un usuario existente en MySQL.
2. `habito_id` debe corresponder a un hábito existente en MySQL.
3. El hábito debe pertenecer al usuario autenticado.
4. `fecha_registro` es obligatoria.
5. `completado` tiene `false` como valor predeterminado.
6. `valor_registrado` es opcional.
7. `notas` es opcional.
8. `notas` debe tener una longitud máxima.
9. Los logs deben crearse exclusivamente desde el backend.
10. Las consultas frecuentes deben utilizar índices.
11. El endpoint de creación debe contar con rate limiting.
12. Debe definirse si se permite uno o múltiples registros por hábito y día.
13. Las fechas deben manejarse de forma consistente.
14. El usuario no debe poder registrar información de otro usuario.
15. El backend debe validar que el hábito pertenece al usuario.
16. Deben implementarse mecanismos de protección contra bots.
17. Las consultas de historial deben utilizar paginación.
18. Los errores internos de MongoDB no deben exponerse directamente al cliente.

---

## 🎯 Resumen

MongoDB se utiliza como almacén especializado para los **logs de hábitos**, mientras que MySQL mantiene la información estructural y relacional de usuarios y hábitos.

Esta separación permite manejar un volumen elevado de registros de seguimiento sin sobrecargar las tablas principales de MySQL.

```text
                         QUANTIFY
                            │
              ┌─────────────┴─────────────┐
              │                           │
            MySQL                     MongoDB
              │                           │
      Datos estructurales              Logs
              │                           │
      ├── Usuarios                  ├── Cumplimiento
      ├── Hábitos                   ├── Valores
      └── Configuración              ├── Notas
                                     ├── Historial
                                     └── Métricas
```

---

## 🧰 Tecnologías

- **Node.js**
- **Express**
- **Mongoose**
- **MongoDB**
- **MySQL**

---

## 🚀 Objetivo final

Proporcionar un sistema eficiente, escalable y seguro para almacenar el historial de cumplimiento de hábitos y permitir la generación de:

- 📊 Métricas.
- 📈 Estadísticas.
- 🔥 Rachas.
- 📅 Historial.
- 🎯 Porcentajes de adherencia.
- 📉 Evolución del usuario.

La combinación de **MySQL + MongoDB** permite separar los datos transaccionales de los datos de seguimiento, proporcionando una arquitectura adecuada para el crecimiento de **QUANTIFY**.