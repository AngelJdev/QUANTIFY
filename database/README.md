# Gobernanza, Almacenamiento y Transformación de Datos (Database Ops)

Este módulo crítico se encarga de la ingeniería relacional (Star Schema) y del saneamiento transitorio algorítmico utilizado por todo el equipo de ciencia de datos (Responsable estipulado: Alejandro Artiaga).

## 1. Arquitectura de Almacén de Datos (Data Warehouse)
A través de la sub-carpeta `/warehouse`, este entorno almacena DDLs crudos (Data Definition Language). 
Aplica topología **Star Schema (Modelo en Estrella)** clásico de Business Intelligence:
- **Tabla de Hechos (Fact Table)**: Métrica pura contable, acumulativa de los registros numéricos de los hábitos (`cantidad completada`, `tiempo dedicado`, `eventos de esfuerzo físico`).
- **Tablas de Dimensiones (Dimension Tables)**: Perspectivas circundantes que explican el contexto (Ej. `Dim_Tiempo` [Fines de semana vs Días Laborales], `Dim_Usuario` [Ubicación, perfil], `Dim_Hábito` [Contexto médico]).

*Esto permite la creación de cubos OLAP, minimizando JOINs computables en la nube.*

## 2. Proceso Pipeline Automatizado (ETL)
Dentro de `/etl`, los scripts de Python estructuran flujos repetibles para que la base final de aprendizaje automático no lea "logs sucios" transaccionales (OLTP):
- **EXTRACT (Extracción)**: Enganche directo con las réplicas en segundo plano de MySQL/MongoDB utilizando cursores optimizados, volcando JSON/CSV estáticos masivos a memoria, bloqueando sobre-cargas operativas en las tablas vivas.
- **TRANSFORM (Transformación)**: Saneamiento puro (Imputación de valores `NaN`, codificación binaria (Dummy Variables / One-hot-Encoding), estandarización, y compresión de marcas temporales, aplicando reglas de dominio específicas.
- **LOAD (Carga)**: Descarga por lotes (Batch) directo en el Data Warehouse modelado en SQL.

## 3. Dumps e Inicializadores Primitivos
Los directorios `/mongo` y `/mysql` disponen de rutinas y ficheros `.sql` puros u orígenes `.bson` asegurando un entorno "Plug and Play". Mediante un simple `seed`, la topología recrea en segundos las métricas completas e iniciales para cualquier entorno local para pruebas unitarias de software.
