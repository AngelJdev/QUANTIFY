# Diccionario de Datos NoSQL — MongoDB (quantify_db)

## Convenciones

| Símbolo | Significado |
|---------|-------------|
| **PK** | Primary Key (identificador principal) |
| **FK** | Foreign Key lógica (referencia a otra colección) |
| **UQ** | Unique (valor único en la colección) |
| **IX** | Indexed (campo indexado para búsquedas rápidas) |
| **NN** | Not Null (campo requerido) |

---

## 1. Colección: `Users`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `sql_id` | Number | ✓ | ✓ | ✓ | — | PK del usuario en MySQL |
| `nombre` | String | ✓ | — | — | — | Nombre completo del usuario |
| `username` | String | ✓ | ✓ | ✓ | — | Nombre de usuario (solo alfanumérico) |
| `email` | String | ✓ | — | — | — | Correo electrónico |
| `rol` | Number | — | — | — | `1` | Rol: 0=Admin, 1=Usuario, 2=Moderador |
| `preferencias` | Object | — | — | — | `null` | Configuración personalizada |
| `avatar_url` | String | — | — | — | `null` | URL de imagen de perfil |
| `current_streak` | Number | — | — | — | `0` | Racha consecutiva actual (días) |
| `max_streak` | Number | — | — | — | `0` | Racha máxima histórica (días) |
| `last_login_date` | Date | — | — | — | `null` | Último inicio de sesión |
| `pais` | String | — | — | — | `México` | País del usuario |
| `fecha_creacion` | Date | — | — | — | `Date.now` | Fecha de registro |

---

## 2. Colección: `UserMetrics`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `sql_id` | Number | ✓ | ✓ | ✓ | — | PK de la métrica en MySQL |
| `usuario_id` | Number | ✓ | — | ✓ | — | FK → Users.sql_id |
| `edad` | Number | ✓ | — | — | — | Edad del usuario (13-100) |
| `peso` | Number | ✓ | — | — | — | Peso en kilogramos |
| `estatura` | Number | ✓ | — | — | — | Estatura en centímetros |
| `genero` | String | ✓ | — | — | — | MASCULINO, FEMENINO, OTRO |
| `nivel_actividad` | String | ✓ | — | — | — | SEDENTARIO, LIGERO, MODERADO, ACTIVO, MUY_ACTIVO |
| `discapacidad` | String | — | — | — | `NINGUNA` | Tipo de discapacidad |
| `ocupacion` | String | — | — | — | `ESTUDIANTE` | Ocupación principal |
| `fecha_creacion` | Date | — | — | — | `Date.now` | Fecha de creación |

---

## 3. Colección: `Habits`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `sql_id` | Number | ✓ | ✓ | ✓ | — | PK del hábito en MySQL |
| `usuario_id` | Number | ✓ | — | ✓ | — | FK → Users.sql_id |
| `nombre` | String | ✓ | — | — | — | Nombre del hábito |
| `descripcion` | String | — | — | — | `null` | Descripción opcional |
| `tipo_medicion` | String | — | — | — | `BOOLEANO` | BOOLEANO, CANTIDAD, TIEMPO, DISTANCIA |
| `meta_diaria` | Number | — | — | — | `null` | Meta numérica diaria |
| `unidad` | String | — | — | — | `null` | Unidad de medida |
| `frecuencia` | String | — | — | — | `DIARIO` | DIARIO, SEMANAL, MENSUAL |
| `fecha_fin` | Date | — | — | — | `null` | Fecha de finalización opcional |
| `duracion_tipo` | String | — | — | — | `null` | Tipo de duración |
| `activo` | Boolean | — | — | — | `true` | Estado del hábito |
| `fecha_creacion` | Date | — | — | — | `Date.now` | Fecha de creación |

---

## 4. Colección: `Logs`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `habito_id` | Number | ✓ | — | ✓ | — | FK → Habits.sql_id |
| `usuario_id` | Number | ✓ | — | ✓ | — | FK → Users.sql_id |
| `fecha_registro` | Date | ✓ | — | — | — | Fecha del registro de cumplimiento |
| `completado` | Boolean | — | — | — | `false` | Si el hábito fue cumplido |
| `valor_registrado` | Number | — | — | — | `null` | Valor numérico registrado |
| `notas` | String | — | — | — | `null` | Notas del usuario |
| `fecha_creacion` | Date | — | — | — | `Date.now` | Timestamp de creación |

**Índice compuesto:** `(habito_id: 1, fecha_registro: -1)`

---

## 5. Colección: `Achievements`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `sql_id` | Number | ✓ | ✓ | ✓ | — | PK del logro en MySQL |
| `usuario_id` | Number | ✓ | — | ✓ | — | FK → Users.sql_id |
| `titulo` | String | ✓ | — | — | — | Título del logro |
| `descripcion` | String | — | — | — | `null` | Descripción del logro |
| `mes_logro` | String | — | — | — | `null` | Mes en que se obtuvo |
| `icono_url` | String | — | — | — | `null` | URL del ícono |
| `fecha_obtencion` | Date | — | — | — | `Date.now` | Fecha de desbloqueo |

---

## 6. Colección: `UserEvents`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `type` | String | ✓ | — | — | — | Tipo de evento: CREATED o DELETED |
| `userId` | Number | — | — | — | — | ID del usuario involucrado |
| `fecha` | Date | — | — | — | `Date.now` | Fecha del evento |

---

## 7. Colección: `Bitacora`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `sql_id` | Number | — | — | ✓ | — | Referencia opcional a MySQL |
| `operacion` | String | ✓ | — | — | — | Tipo: INSERT o DELETE |
| `ip` | String | ✓ | — | — | — | IP del cliente que ejecutó la operación |
| `descripcion` | String | ✓ | — | — | — | Detalle de la operación de población |
| `fecha_hora` | Date | — | — | — | `Date.now` | Timestamp de la operación |

---

## 8. Colección: `bitacora_Admins`

| Campo | Tipo | NN | UQ | IX | Default | Descripción |
|-------|------|:--:|:--:|:--:|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | auto | Identificador MongoDB |
| `admin_id` | Number | ✓ | — | ✓ | — | sql_id del admin/moderador |
| `admin_nombre` | String | ✓ | — | — | — | Nombre del admin/mod |
| `admin_username` | String | ✓ | — | — | — | Username del admin/mod |
| `admin_rol` | String | ✓ | — | — | — | ADMIN o MODERADOR |
| `accion` | String | ✓ | — | ✓ | — | DELETE_USER, DELETE_HABIT, DELETE_ALL_HABITS, ROLE_CHANGE |
| `descripcion` | String | ✓ | — | — | — | Descripción legible de la acción |
| `target_user_id` | Number | — | — | — | `null` | ID del usuario afectado |
| `target_user_nombre` | String | — | — | — | `null` | Nombre del usuario afectado |
| `ip` | String | — | — | — | `0.0.0.0` | IP del admin que ejecutó la acción |
| `fecha` | Date | — | — | ✓ | `Date.now` | Timestamp de la acción |

**Índice compuesto:** `(accion: 1, fecha: -1)`
