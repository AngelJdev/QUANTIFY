# QUANTIFY

Aplicación para seguimiento de hábitos personales (Habit Tracker) diseñada para ayudar a los usuarios a construir rutinas positivas mediante registro, seguimiento y análisis de hábitos.

## Objetivo

Permitir a los usuarios:

- Crear hábitos
- Registrar progreso diario
- Visualizar estadísticas
- Mantener consistencia en sus objetivos

## Tecnologías Usadas

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilizado:** [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Gestión de Formularios:** [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup)
- **Cliente HTTP:** [Axios](https://axios-http.com/)

### Backend
- **Entorno de Ejecución:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/)
- **ORM (SQL):** [Sequelize](https://sequelize.org/) (MySQL)
- **ODM (NoSQL):** [Mongoose](https://mongoosejs.com/) (MongoDB)
- **Autenticación:** [JWT (JSON Web Tokens)](https://jwt.io/) & [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Envío de Correos:** [Nodemailer](https://nodemailer.com/)

### Base de Datos
- **MySQL:** Almacenamiento de datos relacionales (Usuarios, Hábitos, Logros).
- **MongoDB:** Almacenamiento de logs y registros históricos de progreso.

## Diagrama Entidad-Relación (ER)

A continuación se presenta el modelo de datos del sistema, mostrando la relación entre las tablas de MySQL y la colección de logs en MongoDB:

```mermaid
erDiagram
    USER ||--o{ ACHIEVEMENT : "obtiene"
    USER ||--o{ HABIT : "registra"
    USER ||--|| USER_METRIC : "posee"
    USER ||--o{ LOG : "genera"
    HABIT ||--o{ LOG : "historial"

    USER {
        int id PK
        string nombre
        string email UK
        string password_hash
        string security_phrase_hash
        enum rol
        int current_streak
        int max_streak
        date last_login_date
        json preferencias
        timestamp fecha_creacion
    }

    ACHIEVEMENT {
        int id PK
        int usuario_id FK
        string titulo
        string descripcion
        string mes_logro
        string icono_url
        timestamp fecha_obtencion
    }

    HABIT {
        int id PK
        int usuario_id FK
        string nombre
        string descripcion
        enum tipo_medicion
        decimal meta_diaria
        string unidad
        enum frecuencia
        date fecha_fin
        string duracion_tipo
        timestamp fecha_creacion
        boolean activo
    }

    USER_METRIC {
        int id PK
        int usuario_id FK
        int edad
        decimal peso
        int estatura
        enum genero
        enum nivel_actividad
        timestamp fecha_creacion
    }

    LOG {
        string _id PK "MongoDB ID"
        int habito_id FK "SQL ID"
        int usuario_id FK "SQL ID"
        date fecha_registro
        boolean completado
        number valor_registrado
        string notas
        timestamp fecha_creacion
    }
```


## Estructura del proyecto

 QUANTIFY │ 
    ├── docs # Documentación del proyecto 
    ├── frontend # Aplicación cliente 
    ├── backend # API y lógica del servidor 
    ├── database # Esquemas y recursos de base de datos 
    ├── scripts # Scripts de automatización 
    └── README.md


## Flujo de trabajo

Se utiliza un flujo de ramas basado en:

- main
- develop
- feature/*

### Reglas generales

- **main** → versión estable del proyecto  
- **develop** → integración de funcionalidades  
- **feature/** → desarrollo de nuevas funcionalidades  
- **docs/** → cambios en documentación  
- **fix/** → corrección de errores 

## Convención de commits

- **feat:** nueva funcionalidad
- **fix:** corrección de errores
- **docs:** cambios en documentación
- **refactor:** mejora o reorganización del código
- **test:** pruebas
- **chore:** tareas de mantenimiento


## Equipo

Proyecto desarrollado por estudiantes de la **Universidad tecnologica de xicotepec de juarez**.

#### Integrantes

- Al Farias Leyva.
- Angel de Jesus Baños Tellez.
- Jesus Alejandro Artiaga Morales.
- Francisco Garcia Garcia.
