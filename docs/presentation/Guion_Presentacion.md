# 📊 Estructura de Presentación — QUANTIFY

> Guía de contenido para la presentación final del proyecto, organizada en 10 diapositivas.

---

## 🪟 Diapositiva 1 — Portada

| Campo           | Detalle                                                 |
| --------------- | ------------------------------------------------------- |
| **Proyecto**    | QUANTIFY — Sistema de Seguimiento de Hábitos Personales |
| **Alumno**      | _(Nombre completo)_                                     |
| **Materia**     | _(Nombre de la materia)_                                |
| **Docente**     | _(Nombre del docente)_                                  |
| **Universidad** | _(Nombre de la universidad)_                            |
| **Fecha**       | _(Fecha de presentación)_                               |

---

## ⚠️ Diapositiva 2 — Problema Identificado

En la actualidad, muchas personas enfrentan dificultades para mantenerse constantes en sus metas personales. Los principales problemas detectados son:

- 😓 **Dificultad para mantener hábitos saludables** de forma sostenida en el tiempo
- 📉 **Falta de seguimiento personal** sobre el cumplimiento diario de objetivos
- 📊 **Ausencia de estadísticas claras** que permitan evaluar el progreso real
- 🔄 **Baja constancia en objetivos personales** por falta de motivación y visibilidad

---

## 🎯 Diapositiva 3 — Objetivo General

> Desarrollar una aplicación web integral que permita a los usuarios registrar, monitorear y analizar sus hábitos personales, fomentando una mayor disciplina, constancia y organización en su vida diaria.

**Objetivos específicos:**

- Proveer un panel visual con estadísticas de cumplimiento
- Permitir la creación y gestión personalizada de hábitos
- Garantizar una experiencia de usuario fluida e intuitiva
- Asegurar la protección de los datos mediante autenticación segura

---

## 🛠️ Diapositiva 4 — Tecnologías Utilizadas

### 🎨 Frontend

| Tecnología        | Uso principal                          |
| ----------------- | -------------------------------------- |
| **React 19**      | Construcción de la interfaz de usuario |
| **Vite**          | Entorno de desarrollo y bundling       |
| **Tailwind CSS**  | Estilos y diseño responsivo            |
| **Framer Motion** | Animaciones e interacciones visuales   |
| **Recharts**      | Gráficas y visualización de datos      |
| **Formik + Yup**  | Formularios con validación robusta     |

### ⚙️ Backend

| Tecnología     | Uso principal                     |
| -------------- | --------------------------------- |
| **Node.js**    | Entorno de ejecución del servidor |
| **Express.js** | Framework para APIs REST          |
| **Sequelize**  | ORM para base de datos relacional |
| **Mongoose**   | ODM para base de datos documental |
| **JWT**        | Autenticación mediante tokens     |
| **Bcrypt**     | Cifrado seguro de contraseñas     |

### 🗄️ Base de Datos

| Motor       | Tipo          | Uso                                        |
| ----------- | ------------- | ------------------------------------------ |
| **MySQL**   | Relacional    | Usuarios, hábitos, registros estructurados |
| **MongoDB** | No relacional | Historial de actividad, datos flexibles    |

---

## 🏗️ Diapositiva 5 — Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                     CLIENTE                         │
│              React 19 + Tailwind CSS                │
└─────────────────────┬───────────────────────────────┘
                      │  HTTP / REST API
┌─────────────────────▼───────────────────────────────┐
│                    SERVIDOR                         │
│             Node.js + Express.js                    │
│   ┌──────────────┐      ┌──────────────────────┐   │
│   │  Middleware  │      │   Autenticación JWT  │   │
│   │  Validación  │      │   Bcrypt + Tokens    │   │
│   └──────────────┘      └──────────────────────┘   │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
┌─────────────▼──────┐  ┌─────────▼──────────────────┐
│      MySQL         │  │         MongoDB             │
│  (Sequelize ORM)   │  │      (Mongoose ODM)         │
│  Datos relacionales│  │  Historial y actividad      │
└────────────────────┘  └────────────────────────────┘
```

**Características de la arquitectura:**

- 🔒 Autenticación segura con JWT en cada petición privada
- 🔌 APIs REST bien definidas por módulo
- 🗂️ Base de datos híbrida (relacional + documental)
- 📦 Separación clara de responsabilidades por capas

---

## ⚡ Diapositiva 6 — Funcionalidades Principales

| #   | Funcionalidad                    | Descripción                                                |
| --- | -------------------------------- | ---------------------------------------------------------- |
| 1   | 👤 **Registro de usuarios**      | Creación de cuenta con validación y cifrado de datos       |
| 2   | ✏️ **Creación de hábitos**       | Definición de nombre, categoría, frecuencia y meta semanal |
| 3   | 📅 **Seguimiento diario**        | Marcado de hábitos completados por día                     |
| 4   | 📊 **Estadísticas visuales**     | Gráficas de progreso semanal y mensual con Recharts        |
| 5   | 🏆 **Control de progreso**       | Visualización de rachas y porcentaje de cumplimiento       |
| 6   | 📂 **Historial de cumplimiento** | Registro histórico de actividad por hábito                 |

---

## 🤖 Diapositiva 7 — Uso de IA Generativa

La IA generativa fue utilizada como **herramienta de apoyo técnico** en las siguientes áreas del desarrollo:

```
IA Generativa
│
├── 🛡️  Validaciones backend (express-validator)
│       └── Middleware de validación y sanitización de entradas
│
├── 🔐  Autenticación JWT + Bcrypt
│       └── Flujo completo de registro, login y protección de rutas
│
├── 📊  Dashboard estadístico
│       └── Interfaz con Recharts, Tailwind y diseño responsivo
│
└── 📝  Formularios con Formik + Yup
        └── Validaciones en tiempo real y mensajes de error claros
```

> ⚠️ **Uso responsable:** Todo el código generado fue revisado, probado y adaptado manualmente a la arquitectura real del sistema antes de su integración.

---

## ✅ Diapositiva 8 — Resultados Obtenidos

El desarrollo de QUANTIFY arrojó los siguientes resultados:

- ✔️ **Sistema funcional y escalable** listo para producción
- 🎨 **Mejor experiencia de usuario** gracias a animaciones y diseño responsivo
- 📈 **Control más claro de hábitos** con estadísticas visuales en tiempo real
- 🔍 **Visualización eficiente del progreso** mediante gráficas interactivas
- 🔒 **Seguridad robusta** con autenticación JWT y cifrado de contraseñas

---

## 🚧 Diapositiva 9 — Retos Encontrados

Durante el desarrollo se presentaron los siguientes desafíos técnicos:

| Reto                               | Descripción                                          | Solución aplicada                                     |
| ---------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| 🔗 **Integración MySQL + MongoDB** | Gestionar dos motores de base de datos en paralelo   | Uso de Sequelize y Mongoose con configuración modular |
| 🛡️ **Validaciones backend**        | Sanitizar entradas y evitar vulnerabilidades         | Middleware con `express-validator`                    |
| 🔐 **Autenticación segura**        | Proteger rutas privadas y gestionar sesiones         | JWT + Bcrypt con middleware de verificación           |
| 📐 **Estructura escalable**        | Organizar el proyecto para facilitar futuras mejoras | Separación por capas y módulos independientes         |

---

## 💡 Diapositiva 10 — Conclusiones

### Lo que se logró

> QUANTIFY cumplió con su objetivo principal: ofrecer una herramienta útil, funcional y visualmente atractiva para el seguimiento de hábitos personales.

- ✅ Se cumplió el objetivo general del proyecto de forma satisfactoria
- 📱 La aplicación es funcional, responsiva y lista para usuarios reales
- 🚀 La arquitectura modular permite escalar con nuevas funcionalidades
- 🧠 El uso de IA generativa aceleró el desarrollo sin sacrificar calidad

### Impacto esperado

> Un mayor control sobre los hábitos personales se traduce en **mejor productividad, disciplina y bienestar** para el usuario.

### Trabajo futuro

- 📲 Versión móvil nativa (React Native)
- 🔔 Notificaciones push para recordatorios
- 🤝 Módulo social para compartir metas
- 🧠 Recomendaciones inteligentes basadas en patrones del usuario

---

_Presentación desarrollada como parte del proyecto académico QUANTIFY — Sistema de Seguimiento de Hábitos Personales._
