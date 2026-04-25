# ⚙️ QUANTIFY — Backend Core Service

<div align="center">
  <img src="https://img.shields.io/badge/Runtime-Node.js_v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Framework-Express_v4-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Security-Helmet_&_JWT-red?style=for-the-badge" />
</div>

---

### 🚀 DESCRIPCIÓN TÉCNICA
El núcleo de Quantify es un servicio RESTful diseñado bajo una arquitectura de micro-servicios lógicos que gestiona la persistencia de datos mediante un sistema híbrido. Este backend no solo sirve datos, sino que procesa en tiempo real el rendimiento del usuario mediante un motor de gamificación asíncrono.

### 🏛️ ARQUITECTURA DE DATOS HÍBRIDA

#### 🔹 SQL (MySQL + Sequelize)
Utilizado para datos que requieren **Integridad Referencial Estricta**:
- **Usuarios**: Perfiles, credenciales, roles y rachas globales.
- **Hábitos**: Catálogo de actividades y configuraciones de frecuencia.
- **Logros**: Registro oficial de medallas obtenidas.

#### 🔹 NoSQL (MongoDB + Mongoose)
Utilizado para datos de **Alta Volatilidad y Gran Volumen**:
- **Activity Logs**: Cada interacción, cumplimiento o nota del usuario.
- **Biometría**: Datos temporales de peso, pasos y métricas diarias.
- **Bitácoras**: Registro de auditoría del sistema y logs de administrador.

---

### 🎮 MOTOR DE GAMIFICACIÓN (PRECISION ENGINE)
El motor de Quantify (`gamificationEngine.js`) realiza una auditoría de logs en MongoDB cada vez que un usuario interactúa con la plataforma. 
- **Validación Cruzada**: Antes de subir una racha en MySQL, verifica la existencia de logs en MongoDB.
- **Achievements**: Otorga logros basados en tendencias (ej: Sobrecarga Progresiva tras 3 semanas de aumento constante).

---

### 🛠️ HERRAMIENTAS DE ADMINISTRACIÓN & QA
El sistema incluye endpoints especializados para pruebas de rendimiento y mantenimiento:
- **Población Masiva**: `/api/populate/sql` permite inyectar miles de usuarios realistas con un solo clic.
- **Swagger Docs**: Documentación interactiva disponible en `/api-docs`.
- **Backup System**: Scripts automatizados en `NoSQL/scripts/` para respaldos de base de datos.

---

### 📦 INSTALACIÓN & DESARROLLO
1. Instalar dependencias: `npm install`
2. Configurar `.env`:
   ```env
   PORT=5000
   MYSQL_URI=...
   MONGO_URI=...
   JWT_SECRET=...
   ```
3. Iniciar en desarrollo: `npm run dev`

---

### 🛡️ SEGURIDAD
- Implementación de **RBAC** (Role-Based Access Control): Admin, Moderador, Usuario.
- Protección de cabeceras mediante **Helmet**.
- Validación de esquemas con **Express Validator**.
