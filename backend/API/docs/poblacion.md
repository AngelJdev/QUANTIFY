# 🧪 Sistema de Población de Datos — QUANTIFY

Sistema de **población y pruebas de carga masiva** diseñado para validar el almacenamiento, comportamiento y rendimiento de las bases de datos **MySQL y MongoDB** utilizadas por el proyecto **QUANTIFY**.

Este módulo permite generar grandes cantidades de usuarios de prueba bajo diferentes condiciones y escenarios, con el objetivo de evaluar:

- 💾 Capacidad de almacenamiento.
- ⚡ Rendimiento de inserción.
- 🔎 Rendimiento de consultas.
- 📊 Comportamiento con grandes volúmenes de información.
- 🔄 Sincronización entre MySQL y MongoDB.
- 🧹 Procesos de limpieza.
- 🛡️ Protección de información real.
- 📈 Escalabilidad de la arquitectura.

> ⚠️ Este sistema está destinado exclusivamente a **pruebas y ambientes de desarrollo**. Los datos generados no representan usuarios reales.


## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/populate/sql` | Poblar usuarios en MySQL (sincroniza a MongoDB) |
| `DELETE` | `/api/populate/sql` | Eliminar toda la población SQL |
| `POST` | `/api/populate/nosql` | Poblar usuarios directamente en MongoDB |
| `DELETE` | `/api/populate/nosql` | Eliminar toda la población NoSQL |

### Swagger UI
Acceder a la documentación interactiva en: `http://localhost:5000/api-docs`

---

## Tests SQL (Total: 157,268 usuarios)

| # | Cantidad | Descripción | Campos Fijos |
|---|----------|-------------|--------------|
| 1 | 33,333 | Hombres estudiantes | genero=MASCULINO, ocupacion=ESTUDIANTE, edad=13-25 |
| 2 | 13,987 | Discapacitados motriz | discapacidad=MOTRIZ, edad=13-70 |
| 3 | 25,000 | Mujeres profesionales | genero=FEMENINO, edad=22-47 |
| 4 | 50,000 | Mexicanos activos | pais=México, nivel_actividad=ACTIVO, edad=13-70 |
| 5 | 34,948 | Jóvenes sin discapacidad | discapacidad=NINGUNA, edad=18-25 |

## Tests NoSQL (Total: 156,189 usuarios)

| # | Cantidad | Descripción | Campos Fijos |
|---|----------|-------------|--------------|
| 1 | 943 | Mujeres 22-47 años | genero=FEMENINO, edad=22-47 |
| 2 | 40,000 | Sedentarios | nivel_actividad=SEDENTARIO, edad=13-70 |
| 3 | 28,500 | Sudamericanos | paises=[10 países SA], edad=13-70 |
| 4 | 50,746 | Empleados | ocupacion=EMPLEADO, edad=18-65 |
| 5 | 36,000 | Sin discapacidad | discapacidad=NINGUNA, edad=18-35 |

---

## Reglas de Negocio

### Edad
- Mínimo: 13 años (protección de menores)
- Máximo: 70 años

### Correlación Ocupación-Edad
| Rango de edad | Restricción |
|---------------|-------------|
| 13-17 | Solo ESTUDIANTE |
| 18-25 | ESTUDIANTE, EMPLEADO, FREELANCE, DEPORTISTA, ARTISTA, DESEMPLEADO, OTRO |
| 26-40 | Todas excepto JUBILADO |
| 41-55 | Todas excepto ESTUDIANTE |
| 56-70 | Todas |

### Correlación Peso/Estatura por Edad y Género
- Los valores se generan aleatoriamente dentro de rangos antropométricos realistas.
- El género FEMENINO ajusta rangos -5 a -10 kg en peso y -10 cm en estatura.

### Distribución por Defecto (campos aleatorios)
- **Género**: 48% Masculino, 48% Femenino, 4% Otro
- **Discapacidad**: 75% Ninguna, 25% distribuido entre las demás

---

## Tabla Bitácora

Cada operación de población o limpieza queda registrada automáticamente.

### Estructura
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT/ObjectId | Identificador único |
| operacion | ENUM(INSERT, DELETE) | Tipo de operación |
| ip | VARCHAR(45)/String | IP del cliente |
| descripcion | TEXT/String | Detalle de la operación |
| fecha_hora | DATETIME/Date | Timestamp de la operación |

---

## Identificación de Usuarios Poblados
- Todos los usuarios poblados tienen email con dominio `@quantify-pop.test`
- SQL: prefijo `sql_` en el email
- NoSQL: prefijo `nosql_` en el email
- Los endpoints DELETE **nunca** afectan a usuarios reales ni administradores
