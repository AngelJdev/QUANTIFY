# Schema NoSQL — MongoDB (quantify_db)

## Descripción General

La base de datos NoSQL de Quantify opera como **espejo sincronizado** de la base de datos relacional MySQL, almacenando réplicas de los datos principales junto con colecciones exclusivas de auditoría y eventos. La sincronización se realiza mediante hooks de Sequelize (`afterCreate`, `afterUpdate`, `afterDestroy`).

**Motor:** MongoDB Atlas (Cluster0)  
**Base de datos:** `quantify_db`  
**Total de colecciones:** 9

---

## Colecciones

### 1. `Users`
Espejo de la tabla SQL `Users`. Almacena los datos de perfil de cada usuario registrado.

```
{
  _id:              ObjectId       (auto-generado por MongoDB)
  sql_id:           Number         (PK del usuario en MySQL, UNIQUE, INDEX)
  nombre:           String         (nombre completo)
  username:         String         (nombre de usuario único, UNIQUE, INDEX)
  email:            String         (correo electrónico)
  rol:              Number         (0=Admin, 1=Usuario, 2=Moderador)
  preferencias:     Object|null    (configuración del usuario)
  avatar_url:       String|null    (URL del avatar)
  current_streak:   Number         (racha actual en días)
  max_streak:       Number         (racha máxima alcanzada)
  last_login_date:  Date|null      (último inicio de sesión)
  pais:             String         (país de origen)
  fecha_creacion:   Date           (fecha de registro)
}
```

**Índices:** `sql_id` (unique), `username` (unique)

---

### 2. `UserMetrics`
Espejo de la tabla SQL `UserMetrics`. Variables antropométricas del usuario.

```
{
  _id:              ObjectId
  sql_id:           Number         (PK en MySQL, UNIQUE, INDEX)
  usuario_id:       Number         (FK → Users.sql_id, INDEX)
  edad:             Number
  peso:             Number         (kg)
  estatura:         Number         (cm)
  genero:           String         (MASCULINO|FEMENINO|OTRO)
  nivel_actividad:  String         (SEDENTARIO|LIGERO|MODERADO|ACTIVO|MUY_ACTIVO)
  discapacidad:     String         (NINGUNA|MOTRIZ|VISUAL|...)
  ocupacion:        String         (ESTUDIANTE|EMPLEADO|FREELANCE|...)
  fecha_creacion:   Date
}
```

**Índices:** `sql_id` (unique), `usuario_id`

---

### 3. `Habits`
Espejo de la tabla SQL `Habits`. Hábitos creados por los usuarios.

```
{
  _id:              ObjectId
  sql_id:           Number         (UNIQUE, INDEX)
  usuario_id:       Number         (FK → Users.sql_id, INDEX)
  nombre:           String
  descripcion:      String|null
  tipo_medicion:    String         (BOOLEANO|CANTIDAD|TIEMPO|DISTANCIA)
  meta_diaria:      Number|null
  unidad:           String|null
  frecuencia:       String         (DIARIO|SEMANAL|MENSUAL)
  fecha_fin:        Date|null
  duracion_tipo:    String|null
  activo:           Boolean
  fecha_creacion:   Date
}
```

**Índices:** `sql_id` (unique), `usuario_id`

---

### 4. `Logs`
Registros diarios de cumplimiento de hábitos.

```
{
  _id:              ObjectId
  habito_id:        Number         (FK → Habits.sql_id, INDEX)
  usuario_id:       Number         (FK → Users.sql_id, INDEX)
  fecha_registro:   Date
  completado:       Boolean
  valor_registrado: Number|null
  notas:            String|null
  fecha_creacion:   Date
}
```

**Índices:** `habito_id`, `usuario_id`, compuesto `(habito_id, fecha_registro)`

---

### 5. `Achievements`
Logros desbloqueados por los usuarios.

```
{
  _id:              ObjectId
  sql_id:           Number         (UNIQUE, INDEX)
  usuario_id:       Number         (FK → Users.sql_id, INDEX)
  titulo:           String
  descripcion:      String|null
  mes_logro:        String|null
  icono_url:        String|null
  fecha_obtencion:  Date
}
```

**Índices:** `sql_id` (unique), `usuario_id`

---

### 6. `UserEvents`
Registro de eventos de creación y eliminación de usuarios para estadísticas.

```
{
  _id:              ObjectId
  type:             String         (CREATED|DELETED)
  userId:           Number
  fecha:            Date
}
```

---

### 7. `Bitacora`
Auditoría de las operaciones de población masiva de datos (tests de carga).

```
{
  _id:              ObjectId
  sql_id:           Number|null    (INDEX)
  operacion:        String         (INSERT|DELETE)
  ip:               String
  descripcion:      String
  fecha_hora:       Date
}
```

---

### 8. `bitacora_Admins`
Auditoría exclusiva de acciones de administradores y moderadores.

```
{
  _id:                ObjectId
  admin_id:           Number       (sql_id del admin/mod, INDEX)
  admin_nombre:       String
  admin_username:     String
  admin_rol:          String       (ADMIN|MODERADOR)
  accion:             String       (DELETE_USER|DELETE_HABIT|DELETE_ALL_HABITS|ROLE_CHANGE)
  descripcion:        String       (detalle legible de la acción)
  target_user_id:     Number|null  (ID del usuario afectado)
  target_user_nombre: String|null
  ip:                 String
  fecha:              Date
}
```

**Índices:** `admin_id`, `fecha` (desc), compuesto `(accion, fecha)`

---

## Relaciones Lógicas

Las colecciones MongoDB **no tienen relaciones formales** (no hay JOINs ni foreign keys a nivel motor). Sin embargo, las relaciones lógicas se mantienen por convención:

```
Users.sql_id ──────┬──→ UserMetrics.usuario_id    (1:1)
                   ├──→ Habits.usuario_id          (1:N)
                   ├──→ Achievements.usuario_id    (1:N)
                   ├──→ Logs.usuario_id             (1:N)
                   └──→ UserEvents.userId           (1:N)

Habits.sql_id ────────→ Logs.habito_id              (1:N)

bitacora_Admins.admin_id ──→ Users.sql_id           (N:1)
bitacora_Admins.target_user_id ──→ Users.sql_id     (N:1)
```
