# 🗄️ Modelo de Datos: Quantify

Este documento define la estructura de la base de datos para la aplicación Quantify. El enfoque principal es la escalabilidad y la capacidad de registrar tanto hábitos booleanos (completado/no completado) como métricas cuantitativas.

## Diagrama de Entidad-Relación (Lógico)

### 1. Entidad: `Usuario` (Users)
Almacena la información principal de la cuenta.
* `id` (UUID, Primary Key)
* `nombre` (String, Not Null)
* `email` (String, Unique, Not Null)
* `fecha_creacion` (Timestamp, Default NOW)
* `preferencias` (JSON) - *Para configuraciones como tema oscuro, idioma, etc.*

### 2. Entidad: `Habito` (Habits)
Define el hábito que el usuario quiere rastrear.
* `id` (UUID, Primary Key)
* `usuario_id` (UUID, Foreign Key -> Usuario.id)
* `nombre` (String, Not Null) - *Ej: "Leer", "Sentadilla Hack,"Ahorrar", "Meditar", "Beber agua"*
* `descripcion` (String, Nullable)
* `tipo_medicion` (Enum: 'BOOLEANO', 'NUMERICO', 'TIEMPO') - *Crucial para saber si se registra un "Check", un valor en Kg/Lbs, o minutos.*
* `meta_diaria` (Decimal, Nullable) - *El objetivo a alcanzar.*
* `unidad` (String, Nullable) - *Ej: "páginas", "$ pesos", "minutos", "litros".*
* `frecuencia` (Enum: 'DIARIO', 'SEMANAL', 'PERSONALIZADO')
* `fecha_creacion` (Timestamp, Default NOW)
* `activo` (Boolean, Default TRUE)

### 3. Entidad: `Registro` (Logs)
Almacena cada vez que el usuario interactúa con un hábito en un día específico.
* `id` (UUID, Primary Key)
* `habito_id` (UUID, Foreign Key -> Habito.id)
* `fecha_registro` (Date, Not Null)
* `completado` (Boolean, Default FALSE) - *Para hábitos de sí/no.*
* `valor_registrado` (Decimal, Nullable) - *Para rastrear progreso real (Ej: 50.0 para 50kg/lbs o 15 para páginas leidas o dinero ahorrado).*
* `notas` (String, Nullable) - *Ej: "Me costó más trabajo hoy pero salieron las reps".*
* `fecha_creacion` (Timestamp, Default NOW)

## Relaciones
* Un **Usuario** puede tener **muchos Hábitos** (1:N).
* Un **Hábito** puede tener **muchos Registros** (1:N).

## Notas de Diseño
* Se incluyó el campo `tipo_medicion` y `valor_registrado` para asegurar que el sistema no se limite a simples "rachas", sino que permita almacenar pesos, tiempos o distancias y graficar la mejora de fuerza o resistencia con el tiempo.

## Modelo de Datos Analíticos (ML Features - Etapa 4)
Para la implementación de Machine Learning, se estructuró una entidad o abstracción analítica de características (Features) construida durante el ETL. Esto mapea la realidad del usuario al algoritmo de predicción.

### Entidad (Plano Dimensional): `ML_User_Features` (Vector de Entrada)
Datos pre-procesados dirigidos a inferencias de los modelos Supervisados y Clustering No Supervisados.
* `usuario_id` (UUID, Referencia) -> Identificador llave.
* `dias_activo_totales` (Int) -> (Origen: MySQL Habit Logs). Contador continuo de días.
* `tasa_adherencia_global` (Decimal) -> (%) Métrica calculada de consistencia general.
* `friccion_promedio` (Decimal) -> Promedio derivado de la varianza en metas y notas (Dificultad).
* `racha_maxima_dias` (Int) -> Streaks más largos del usuario.
* `cluster_id` (Int, Nullable) -> Resultado insertado post-predicción No Supervisada.

### Fuentes de Información (Origen a Ingestar)
1. **Sistema OLTP Relacional (MySQL):** Identidades de usuario e hitos.
2. **Sistema OLTP Documental (MongoDB):** Eventos transaccionales binarios y cualitativos diarios (Logs).
3. **Simulador Determinista Sintético (Python):** Al no contar con biometría masiva conectada a hardware real intra-aula, la plataforma se simula a nivel "salud" a través de scripts de siembra determinista (`np.random.seed(2026)`).