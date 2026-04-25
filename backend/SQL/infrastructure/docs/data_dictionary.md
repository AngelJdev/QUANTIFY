# DICCIONARIO DE DATOS - QUANTIFY (MySQL)
**Versión**: 1.1 | **Fecha**: 25 de abril, 2026

## 1. Introducción
Este documento detalla la estructura relacional de la base de datos `quantify_db`. El diseño está optimizado para integridad transaccional mediante el uso del motor InnoDB y llaves foráneas para mantener la consistencia de los datos.

---

## 2. Definición de Tablas

### 2.1 Tabla: `Users`
Almacena la información de identidad y el estado global de gamificación del usuario.

| Columna | Tipo | Nulo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | NO | Llave Primaria (Autoincremental). |
| `nombre` | VARCHAR(255) | NO | Nombre completo del usuario. |
| `email` | VARCHAR(255) | NO | Correo único (Índice Único). |
| `password_hash` | VARCHAR(255) | NO | Hash de seguridad de la contraseña. |
| `rol` | INT | SI | Rol del usuario (1: User, 2: Moderator, 3: Admin). |
| `username` | VARCHAR(30) | SI | Nombre de usuario único para la comunidad. |
| `current_streak` | INT | SI | Racha actual de hábitos completados. |
| `max_streak` | INT | SI | Récord histórico de racha. |
| `last_login_date` | DATE | SI | Fecha del último acceso procesado por el motor. |

### 2.2 Tabla: `Habits`
Define el catálogo de actividades que los usuarios desean rastrear.

| Columna | Tipo | Nulo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | NO | Llave Primaria. |
| `usuario_id` | INT | NO | FK vinculada a `Users.id`. |
| `nombre` | VARCHAR(255) | NO | Título del hábito. |
| `frecuencia` | ENUM | NO | Diario, Semanal, etc. |
| `activo` | BOOLEAN | NO | Estado de visibilidad del hábito. |

### 2.3 Tabla: `SecurityAuditLogs` (Bitácora)
Sistema de auditoría para trazabilidad de cambios sensibles.

| Columna | Tipo | Nulo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | NO | Llave Primaria. |
| `tabla_afectada` | VARCHAR(50) | NO | Nombre de la tabla (ej: Users). |
| `registro_id` | INT | NO | ID del registro modificado. |
| `accion` | ENUM | NO | INSERT, UPDATE o DELETE. |
| `valor_anterior` | JSON | SI | Captura del estado previo al cambio. |
| `valor_nuevo` | JSON | SI | Captura del estado posterior al cambio. |
| `fecha_cambio` | TIMESTAMP | NO | Timestamp automático del evento. |

---

## 3. Justificación de Integridad
- **Motores**: Se utiliza **InnoDB** para soportar transacciones ACID.
- **Relaciones**: Llaves foráneas con `ON DELETE CASCADE` para evitar registros huérfanos.
- **Auditoría**: Despliegue de Triggers para garantizar que ninguna modificación pase desapercibida por el equipo de ingeniería.
