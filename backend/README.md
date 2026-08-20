# Backend RESTful API & WebSocket Server (Node.js)

Este subsistema opera como el cerebro de infraestructura de la plataforma QUANTIFY, actuando como controlador de trafico entre las bases de datos de alta disponibilidad y las interfaces cliente.

## 1. Arquitectura de Software
Implementa un patron de **Micro-Framework sobre Express.js**. El servidor no expone vistas renderizadas (sin SSR), operando puramente como una API RESTful JSON mediante controladores enrutados.
- **Hilos de Ejecucion**: Delega cargas sintéticas y cálculos de Machine Learning al sistema operativo local mediante `child_process`, previniendo que la ejecucion asincronica de los modelos de Python bloquee el _Event Loop_ principal de Node.js.
- **Patrones Intersectores**: Aplica Patrón Middleware para segregación responsabilidades (Autenticación JWT, Parseo CORS, Tasa Limite y Boundaries globales de Error).

## 2. Bases de Datos Híbridas (Políglota)
La principal proeza de este backend es su capa de abstracción dual:
- **Capa Relacional (SQL)**: Mediante el ORM *Sequelize*, gestiona entidades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad) absolutas. Esto involucra los tokens OTP del smartwatch, claves encriptadas bcrypt, y perfiles de usuarios. No importa la carga, el registro de la persona es inmutable.
- **Capa NoSQL (MongoDB)**: Mediante *Mongoose*, intercepta las avalanchas de telemetria ("Event Sourcing" y Logs de hábitos). Se sacrifican constraints rigidas por rendimiento de escritura puro. Aquí reside el "Motor Gamificador" que calcula rachas continuas tolerando alta concurrencia masiva (ej. inyeccion de 300k eventos simultaneos).

## 3. Integración bidireccional (WebSockets)
Se incluye un manejador `Socket.IO` instanciado junto al núcleo HTTP:
A diferencia del REST tradicional (Request-Response), cuando el servicio backend determina pasivamente que un usuario alcanzo un umbral critico (ej. probabilidad de Burnout post-insercion SQL), el backend orquesta y empuja (`emits`) un evento nativo a las interfaces abiertas, rompiendo la latencia del refresco clásico (polling).

## 4. Swagger y Pruebas Unitarias
El servicio es 100% autodocumentado a traves del estándar OpenAPI (Swagger 3.0). El acceso al modulo de integracion interactivo se encuentra mediante `/api-docs` durante instanciación del entorno `NODE_ENV=development`.

## 5. Estructura Exacta del Directorio
```text
backend/
├── API/             
│   ├── routes/      # Mapeo HTTP hacia los Controladores
│   ├── controllers/ # Lógica de Negocio Pura (Auth, Gamificación)
│   └── docs/        # Especificaciones JSDoc y Swagger Config
├── NoSQL/           # Entidades MongoDB y esquemas flexibles
├── SQL/             # Modelos estrictos, migraciones y seeds SQL
├── utils/           # Herramientas de cifrado JWT, Hashing
└── server.js        # Entry point y conector dual de DBs
```
