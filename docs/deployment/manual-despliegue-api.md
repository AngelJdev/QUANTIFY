# Manual de Despliegue de API's: QUANTIFY

Este manual proporciona una guía detallada y profesional para configurar, desplegar y mantener el backend de la plataforma **QUANTIFY Habit Tracker** en entornos de desarrollo y producción.

---

## 1. Introducción

El backend de **QUANTIFY** es una API REST robusta construida con **Node.js** y **Express**. Para satisfacer los requisitos de rendimiento, consistencia relacional y auditoría flexible, la aplicación emplea una arquitectura de base de datos híbrida:

*   **MySQL (vía Sequelize ORM):** Maneja los datos transaccionales, las relaciones de usuario, el progreso de hábitos, métricas y logros.
*   **MongoDB (vía Mongoose):** Administra registros de soporte, tickets de usuario e historial flexible (logs de auditoría).

Este documento está dirigido a administradores de sistemas, ingenieros de DevOps y desarrolladores encargados del despliegue y puesta en marcha del backend.

---

## 2. Requisitos Previos del Sistema

Antes de iniciar el despliegue, asegúrese de que el servidor cumpla con los siguientes requisitos mínimos:

### 2.1. Software Base
*   **Node.js:** Versión `18.x` o superior (Recomendado: LTS `20.x` o superior).
*   **npm:** Versión `9.x` o superior.
*   **MySQL Server:** Versión `8.0` o superior.
*   **MongoDB:** Instancia local de MongoDB (`v6.0+`) o una suscripción activa a un clúster gestionado de **MongoDB Atlas**.

### 2.2. Utilidades de Despliegue (Recomendado para Producción)
*   **PM2:** Gestor de procesos en Node.js para asegurar la alta disponibilidad de la API.
*   **Docker & Docker Compose:** Si se prefiere un despliegue contenedorizado.
*   **Nginx:** Como servidor web y proxy inverso.
*   **Certbot (Let's Encrypt):** Para la automatización y obtención de certificados SSL/TLS.

---

## 3. Configuración del Entorno (`.env`)

El backend de QUANTIFY requiere un archivo `.env` en la raíz de la carpeta `/backend` para cargar todas las variables de entorno operativas.

### 3.1. Plantilla de Variables (`.env.production`)
A continuación se detalla la configuración y significado de cada variable:

```ini
PORT=5000

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=TuPasswordSeguroAqui
MYSQL_DATABASE=quantify_db

# MongoDB Configuration
# Si usas Atlas, ingresa el string SRV completo. Asegúrate de codificar caracteres especiales de la contraseña.
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/quantify_logs?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=reemplaza_esto_con_un_hash_seguro_de_64_caracteres_en_produccion
JWT_EXPIRES_IN=24h

# Mailtrap SMTP (Email Sandbox / Producción)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=tu_usuario_smtp
MAILTRAP_PASS=tu_password_smtp
MAILTRAP_FROM=Quantify <no-reply@quantify.app>```

### 3.2. Descripción Detallada de las Variables

| Variable | Tipo | Descripción | Recomendación de Producción |
| :--- | :--- | :--- | :--- |
| `PORT` | Número | Puerto de escucha de Express. | `5000` (detrás de Nginx) |
| `MYSQL_HOST` | Host | Dirección IP o dominio del servidor MySQL. | `127.0.0.1` o host administrado (ej. AWS RDS) |
| `MYSQL_PASSWORD`| Texto | Contraseña de la base de datos MySQL. | Usar contraseña con alta entropía |
| `MONGO_URI` | URI | String de conexión a MongoDB. | Conexión SSL de MongoDB Atlas |
| `JWT_SECRET` | Texto | Clave secreta para firmar tokens JWT. | Generar con `openssl rand -hex 64` |
| `JWT_EXPIRES_IN`| Tiempo | Tiempo de expiración de sesión. | `24h` o menor para máxima seguridad |
| `MAILTRAP_HOST` | Host | Servidor SMTP para envío de notificaciones. | Proveedor real de correo (ej. Sendgrid, Resend) |

---

## 4. Instalación y Ejecución en Desarrollo

Para configurar la aplicación localmente en un entorno de desarrollo, siga los siguientes pasos desde la terminal:

### Paso 1: Clonar e instalar dependencias
```bash
cd backend
npm install
```

### Paso 2: Crear la Base de Datos Relacional
Acceda a su cliente de MySQL y cree la base de datos vacía definida en su `.env`:
```sql
CREATE DATABASE quantify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 3: Iniciar en Modo Desarrollo
Ejecute el comando de inicio en modo de desarrollo con recarga automática:
```bash
npm run dev
```

> [!NOTE]
> Durante la inicialización del backend, el sistema ejecutará automáticamente una sincronización de modelos con `sequelize.sync({ alter: true })`. Esto creará todas las tablas necesarias y ejecutará el sembrado de administradores por defecto a través de `seedAdmins()`.

---

## 5. Estrategia de Despliegue en Producción

Para entornos de producción, existen dos metodologías principales de despliegue. Elija la que mejor se adapte a su infraestructura.

### 5.1. Despliegue Tradicional con PM2
PM2 es un administrador de procesos para Node.js que mantiene activa la aplicación, permitiendo recargas sin tiempo de inactividad, monitoreo en tiempo real y reinicio automático si la app falla.

#### 1. Instalar PM2 Globalmente
```bash
npm install -g pm2
```

#### 2. Crear Archivo de Configuración `ecosystem.config.cjs`
Cree este archivo en la raíz del directorio `/backend`:
```javascript
module.exports = {
  apps: [{
    name: 'quantify-backend',
    script: 'server.js',
    instances: 'max', // Modo cluster según núcleos de la CPU
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '800M', // Evita memory leaks
    error_file: './logs/pm2-err.log',
    out_file: './logs/pm2-out.log',
    time: true
  }]
};
```

#### 3. Iniciar la Aplicación en Producción
```bash
pm2 start ecosystem.config.cjs --env production
```

#### 4. Configurar el Inicio Automático en el Sistema Operativo
Para asegurar que la aplicación vuelva a iniciarse tras un reinicio del servidor físico:
```bash
pm2 startup
# Siga las instrucciones en pantalla y luego guarde la configuración actual:
pm2 save
```

---

### 5.2. Despliegue Contenedorizado con Docker
Si utiliza arquitecturas de microservicios o Kubernetes, se recomienda Docker.

#### 1. Crear el Archivo `Dockerfile`
En la raíz de `/backend`, cree un archivo `Dockerfile`:
```dockerfile
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 5000

# Ejecutar aplicación
CMD ["node", "--no-deprecation", "server.js"]
```

#### 2. Crear `docker-compose.yml` (Orquestación Completa)
Para arrancar el Backend, MySQL y MongoDB de forma automatizada:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MYSQL_HOST=mysql-db
      - MYSQL_PORT=3306
      - MYSQL_USER=quantify_user
      - MYSQL_PASSWORD=SecurePassword2026
      - MYSQL_DATABASE=quantify_db
      - MONGO_URI=mongodb://mongo-db:27017/quantify_logs
      - JWT_SECRET=ProductionSuperSecretKeyHash64Bytes
      - JWT_EXPIRES_IN=24h
    depends_on:
      - mysql-db
      - mongo-db
    restart: always

  mysql-db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: RootPasswordSecure2026
      MYSQL_DATABASE: quantify_db
      MYSQL_USER: quantify_user
      MYSQL_PASSWORD: SecurePassword2026
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  mongo-db:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: always

volumes:
  mysql_data:
  mongo_data:
```

#### 3. Ejecutar Contenedores
```bash
docker-compose up -d --build
```

---

## 6. Configuración de Nginx como Proxy Inverso

En producción, nunca exponga directamente el puerto de Node.js (`5000`) a Internet. Utilice Nginx para controlar la seguridad, el almacenamiento en caché y la terminación de SSL/TLS.

### 6.1. Configuración del Bloque de Servidor en Nginx
Cree o edite el archivo `/etc/nginx/sites-available/quantify`:

```nginx
server {
    listen 80;
    server_name api.quantifyapp.com; # Reemplace por su dominio real

    # Redirección automática a HTTPS (opcional, Certbot lo hace solo)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.quantifyapp.com;

    # SSL Configured by Certbot
    ssl_certificate /etc/letsencrypt/live/api.quantifyapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.quantifyapp.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Seguridad extra
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Endpoint para Swagger Docs
    location /api-docs {
        proxy_pass http://127.0.0.1:5000/api-docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Habilite la configuración y reinicie Nginx:
```bash
ln -s /etc/nginx/sites-available/quantify /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 7. Mantenimiento, Monitoreo y Copias de Seguridad

Mantener la salud operativa es crítico tras el despliegue.

### 7.1. Verificación de Salud de la API
La API expone un endpoint `/api/health` para el monitoreo automatizado. Este devuelve un estado HTTP `200` si el servidor Express está levantado correctamente:
```bash
curl -I https://api.quantifyapp.com/api/health
```

### 7.2. Respaldos Automatizados de Datos (Cron Job)
Configure tareas en `crontab` en su servidor Linux para salvaguardar las bases de datos.

#### 1. Programar Copia de Seguridad MySQL (Diario 2:00 AM)
```bash
0 2 * * * mysqldump -u root -p'TuPasswordSeguroAqui' quantify_db | gzip > /opt/backups/mysql/quantify_db_$(date +\%F).sql.gz
```

#### 2. Programar Copia de Seguridad MongoDB (Diario 2:30 AM)
```bash
30 2 * * * mongodump --uri="mongodb://localhost:27017/quantify_logs" --archive=/opt/backups/mongo/quantify_logs_$(date +\%F).archive --gzip
```

---

## 8. Resolución de Problemas (Troubleshooting)

### 8.1. Error: `EADDRINUSE: address already in use :::5000`
*   **Causa:** Otra aplicación o instancia fantasma de Node.js está ocupando el puerto `5000`.
*   **Solución:**
    *   *En Linux:* `fuser -k 5000/tcp` (fuerza la finalización del proceso ocupante).
    *   *En Windows (PowerShell):* `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`.

### 8.2. Error: `SequelizeConnectionRefusedError`
*   **Causa:** El backend no puede comunicarse con el servicio MySQL.
*   **Solución:**
    1.  Verifique que el servicio de MySQL esté corriendo (`systemctl status mysql`).
    2.  Revise que el host y puerto en el `.env` sean correctos.
    3.  Asegure que las credenciales de usuario sean las correctas.

### 8.3. Error de Conexión a MongoDB Atlas
*   **Causa:** Fallo en el protocolo de enlace SSL o la dirección IP del servidor no está permitida en la lista blanca de Atlas.
*   **Solución:**
    1.  Vaya a la consola de **MongoDB Atlas -> Network Access** y añada la IP pública de su servidor de despliegue.
    2.  Verifique que la URL de conexión no tenga caracteres especiales sin codificar en la contraseña (por ejemplo, `%40` en lugar de `@`).
