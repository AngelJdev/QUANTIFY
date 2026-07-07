import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Despliegue de API's — QUANTIFY</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-light: #818cf8;
            --primary-dark: #3730a3;
            --secondary: #06b6d4;
            --secondary-light: #22d3ee;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
            --indigo-50: #eff6ff;
            --emerald-50: #ecfdf5;
            --emerald-600: #059669;
            --amber-50: #fffbeb;
            --amber-600: #d97706;
            --rose-50: #fef2f2;
            --rose-600: #e11d48;
        }

        @page {
            size: A4;
            margin: 2cm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            color: var(--slate-700);
            background-color: #ffffff;
            line-height: 1.6;
            font-size: 10.5pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Helper Classes */
        .page {
            page-break-after: always;
            position: relative;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        /* Cover Page */
        .cover-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2.5cm 0;
            box-sizing: border-box;
        }

        .cover-accent {
            width: 80px;
            height: 8px;
            background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: 9999px;
            margin-bottom: 2.5rem;
        }

        .cover-badge {
            display: inline-block;
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
            color: var(--primary);
            font-size: 0.85rem;
            font-weight: 700;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(79, 70, 229, 0.2);
        }

        .cover-title {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.15;
            color: var(--slate-900);
            letter-spacing: -0.02em;
        }

        .cover-subtitle {
            font-size: 1.35rem;
            font-weight: 400;
            color: #64748b;
            margin-top: 1rem;
            max-width: 90%;
        }

        .cover-meta {
            margin-top: auto;
            border-top: 2px solid var(--slate-100);
            padding-top: 2.5rem;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .meta-group {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.25rem;
        }

        .meta-val {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--slate-800);
        }

        /* Typography & Structure */
        h1.section-title {
            page-break-before: always;
            font-size: 2.2rem;
            font-weight: 800;
            color: var(--slate-900);
            border-bottom: 2px solid var(--slate-100);
            padding-bottom: 0.75rem;
            margin-bottom: 2rem;
            margin-top: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        h1.section-title::after {
            content: "";
            width: 40px;
            height: 4px;
            background: var(--primary);
            border-radius: 9999px;
            display: block;
        }

        h2 {
            font-size: 1.45rem;
            font-weight: 700;
            color: var(--slate-900);
            margin-top: 2rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }

        h2::before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 1.1em;
            background: linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%);
            margin-right: 0.75rem;
            border-radius: 2px;
        }

        h3 {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--slate-800);
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        p {
            margin-bottom: 1.2rem;
            text-align: justify;
            color: var(--slate-700);
        }

        /* Lists */
        ul, ol {
            margin-bottom: 1.2rem;
            padding-left: 1.5rem;
        }

        li {
            margin-bottom: 0.4rem;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 9pt;
        }

        th {
            background-color: var(--slate-100);
            color: var(--slate-900);
            font-weight: 700;
            text-align: left;
            padding: 0.75rem 1rem;
            border-bottom: 2px solid var(--slate-200);
        }

        td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--slate-100);
            color: var(--slate-700);
        }

        tr:nth-child(even) {
            background-color: var(--slate-50);
        }

        /* Code Blocks */
        pre {
            background-color: var(--slate-900);
            border-radius: 8px;
            padding: 1.25rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            border: 1px solid #1e293b;
        }

        code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 8.5pt;
            color: #cbd5e1;
        }

        :not(pre) > code {
            background-color: var(--slate-100);
            color: var(--rose-600);
            padding: 0.15rem 0.35rem;
            border-radius: 4px;
            font-size: 9pt;
            border: 1px solid var(--slate-200);
        }

        /* Callouts / Alerts */
        .callout {
            border-left: 4px solid;
            border-radius: 0 8px 8px 0;
            padding: 1.25rem;
            margin: 1.5rem 0;
        }

        .callout-title {
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
        }

        .callout-info {
            background-color: var(--indigo-50);
            border-color: var(--primary);
            color: var(--primary-dark);
        }

        .callout-tip {
            background-color: var(--emerald-50);
            border-color: var(--emerald-600);
            color: #064e3b;
        }

        .callout-warning {
            background-color: var(--amber-50);
            border-color: var(--amber-600);
            color: #78350f;
        }

        /* Index Layout */
        .index-container {
            margin-top: 3rem;
        }

        .index-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.85rem;
            align-items: flex-end;
            font-size: 1.1rem;
        }

        .index-name {
            font-weight: 500;
            color: var(--slate-800);
        }

        .index-dots {
            flex-grow: 1;
            border-bottom: 2px dotted var(--slate-200);
            margin: 0 0.75rem 0.25rem 0.75rem;
        }

        .index-page-num {
            font-weight: 700;
            color: var(--primary);
        }

        /* Syntax colors */
        .c-comment { color: #64748b; font-style: italic; }
        .c-string { color: #34d399; }
        .c-number { color: #fb7185; }
        .c-keyword { color: #818cf8; font-weight: 500; }
        .c-fn { color: #38bdf8; }
        .c-db { color: #a7f3d0; }

        /* Grid cards */
        .arch-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin: 1.5rem 0;
        }

        .arch-card {
            border: 1px solid var(--slate-200);
            background-color: var(--slate-50);
            border-radius: 8px;
            padding: 1.25rem;
        }

        .arch-card-title {
            font-weight: 700;
            color: var(--slate-900);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
        }

        .arch-card-title span {
            width: 10px;
            height: 10px;
            border-radius: 9999px;
            margin-right: 0.5rem;
            display: inline-block;
        }

        .bullet-mysql { background-color: #3b82f6; }
        .bullet-mongo { background-color: #10b981; }

    </style>
</head>
<body>

    <!-- PORTADA -->
    <div class="page">
        <div class="cover-container">
            <div class="cover-accent"></div>
            <div>
                <span class="cover-badge">Manual de Infraestructura</span>
                <h1 class="cover-title">Desarrollo de un Manual<br>de Despliegue de API's</h1>
                <p class="cover-subtitle">Guía de arquitectura híbrida (MySQL & MongoDB), variables de entorno, contenedorización con Docker, administración de procesos con PM2 y proxy inverso con Nginx en entornos de alta disponibilidad.</p>
            </div>
            <div class="cover-meta">
                <div class="meta-group">
                    <span class="meta-label">Proyecto</span>
                    <span class="meta-val">QUANTIFY — Habit Tracker</span>
                </div>
                <div class="meta-group">
                    <span class="meta-label">Autor</span>
                    <span class="meta-val">Equipo de Ingeniería QUANTIFY</span>
                </div>
                <div class="meta-group">
                    <span class="meta-label">Versión</span>
                    <span class="meta-val">v1.0.0 (Producción)</span>
                </div>
                <div class="meta-group">
                    <span class="meta-label">Fecha</span>
                    <span class="meta-val">Mayo 19, 2026</span>
                </div>
            </div>
        </div>
    </div>

    <!-- INDICE DE CONTENIDOS -->
    <div class="page">
        <h1 class="section-title">Índice de Contenido</h1>
        <div class="index-container">
            <div class="index-item">
                <span class="index-name">1. Introducción y Arquitectura Operativa</span>
                <span class="index-dots"></span>
                <span class="index-page-num">03</span>
            </div>
            <div class="index-item">
                <span class="index-name">2. Requisitos Previos del Sistema</span>
                <span class="index-dots"></span>
                <span class="index-page-num">04</span>
            </div>
            <div class="index-item">
                <span class="index-name">3. Configuración Detallada del Entorno (.env)</span>
                <span class="index-dots"></span>
                <span class="index-page-num">04</span>
            </div>
            <div class="index-item">
                <span class="index-name">4. Puesta en Marcha en Desarrollo</span>
                <span class="index-dots"></span>
                <span class="index-page-num">05</span>
            </div>
            <div class="index-item">
                <span class="index-name">5. Despliegue Tradicional con PM2 (Alta Disponibilidad)</span>
                <span class="index-dots"></span>
                <span class="index-page-num">06</span>
            </div>
            <div class="index-item">
                <span class="index-name">6. Despliegue Containerizado con Docker Compose</span>
                <span class="index-dots"></span>
                <span class="index-page-num">07</span>
            </div>
            <div class="index-item">
                <span class="index-name">7. Configuración de Nginx y Certificado SSL (Proxy Inverso)</span>
                <span class="index-dots"></span>
                <span class="index-page-num">08</span>
            </div>
            <div class="index-item">
                <span class="index-name">8. Mantenimiento, Copias de Seguridad y Monitoreo</span>
                <span class="index-dots"></span>
                <span class="index-page-num">09</span>
            </div>
            <div class="index-item">
                <span class="index-name">9. Guía de Solución de Problemas (Troubleshooting)</span>
                <span class="index-dots"></span>
                <span class="index-page-num">10</span>
            </div>
        </div>
    </div>

    <!-- SECCION 1 -->
    <div class="page">
        <h1 class="section-title">1. Introducción y Arquitectura</h1>
        <p>El backend de <strong>QUANTIFY</strong> ha sido diseñado bajo un paradigma híbrido de persistencia de datos. Esta arquitectura combina las fortalezas del almacenamiento relacional y documental, logrando una combinación perfecta entre consistencia ACID y escalabilidad flexible.</p>
        
        <h2>Esquema de Bases de Datos Híbrido</h2>
        <p>A diferencia de sistemas monolíticos que dependen de una sola base de datos, QUANTIFY segmenta sus responsabilidades de la siguiente manera:</p>
        
        <div class="arch-grid">
            <div class="arch-card">
                <div class="arch-card-title">
                    <span class="bullet-mysql"></span> MySQL (Sequelize ORM)
                </div>
                <p style="font-size: 9pt; margin-bottom: 0;">Gestiona los datos estructurados altamente relacionales: cuentas de usuario, control estricto de hábitos, registros diarios de métricas de salud, conquistas de logros e historial transaccional de auditoría (Bitácora).</p>
            </div>
            <div class="arch-card">
                <div class="arch-card-title">
                    <span class="bullet-mongo"></span> MongoDB (Mongoose ODM)
                </div>
                <p style="font-size: 9pt; margin-bottom: 0;">Maneja almacenamiento de documentos semiestructurados como tickets de soporte técnico, retroalimentación del usuario y almacenamiento secundario flexible que no requiere integridad referencial estricta.</p>
            </div>
        </div>

        <div class="callout callout-info">
            <div class="callout-title">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:1.2rem; height:1.2rem; margin-right:0.4rem; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                Nota sobre Sincronización Automática
            </div>
            <p style="font-size: 9pt; margin-bottom: 0;">En entornos de desarrollo local, el servidor de Express sincroniza automáticamente los modelos de Sequelize llamando a <code>sequelize.sync({ alter: true })</code> en su inicialización, además de poblar los usuarios administradores necesarios si no existiesen.</p>
        </div>
    </div>

    <!-- SECCION 2 & 3 -->
    <div class="page">
        <h1 class="section-title">2. Requisitos & 3. Configuración</h1>
        
        <h2>2. Requisitos Previos del Sistema</h2>
        <p>Asegúrese de que el entorno cumpla con las siguientes dependencias:</p>
        <ul>
            <li><strong>Node.js:</strong> Versión mínima <code>18.x</code>. Recomendado <code>20.x LTS</code>.</li>
            <li><strong>MySQL Server:</strong> Versión <code>8.0+</code>, configurado con codificación <code>utf8mb4</code>.</li>
            <li><strong>MongoDB Instance:</strong> Conexión local activa o una instancia configurada en <strong>MongoDB Atlas</strong>.</li>
        </ul>

        <h2>3. Variables de Entorno (.env)</h2>
        <p>El backend utiliza el archivo <code>.env</code> ubicado en la raíz de la carpeta <code>/backend</code> para su correcto funcionamiento. A continuación se listan y explican las variables utilizadas:</p>

        <table>
            <thead>
                <tr>
                    <th>Variable</th>
                    <th>Valor de Ejemplo</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>PORT</code></td>
                    <td><code>5000</code></td>
                    <td>Puerto en el que se ejecuta la API de Express.</td>
                </tr>
                <tr>
                    <td><code>MYSQL_HOST</code></td>
                    <td><code>localhost</code></td>
                    <td>Dirección IP o host del servidor MySQL.</td>
                </tr>
                <tr>
                    <td><code>MYSQL_USER</code></td>
                    <td><code>root</code></td>
                    <td>Usuario administrativo de MySQL.</td>
                </tr>
                <tr>
                    <td><code>MYSQL_DATABASE</code></td>
                    <td><code>quantify_db</code></td>
                    <td>Nombre de la base de datos MySQL relacional.</td>
                </tr>
                <tr>
                    <td><code>MONGO_URI</code></td>
                    <td><code>mongodb+srv://...</code></td>
                    <td>String de conexión (SRV) para MongoDB.</td>
                </tr>
                <tr>
                    <td><code>JWT_SECRET</code></td>
                    <td><code>un_secreto_robusto...</code></td>
                    <td>Semilla usada para firmar los tokens de sesión.</td>
                </tr>
                <tr>
                    <td><code>MAILTRAP_USER</code></td>
                    <td><code>faee107ba8fa9f</code></td>
                    <td>Usuario SMTP para envío de notificaciones por mail.</td>
                </tr>
            </tbody>
        </table>

        <div class="callout callout-warning">
            <div class="callout-title">Seguridad de Producción</div>
            <p style="font-size: 9pt; margin-bottom: 0;"><strong>NUNCA</strong> exponga o suba el archivo <code>.env</code> a repositorios de control de versiones Git. Genere siempre una clave segura y robusta de al menos 64 caracteres usando <code>openssl rand -hex 64</code> para la variable <code>JWT_SECRET</code> en servidores de producción.</p>
        </div>
    </div>

    <!-- SECCION 4 -->
    <div class="page">
        <h1 class="section-title">4. Puesta en Marcha en Desarrollo</h1>
        <p>Siga estos pasos estructurados para configurar su entorno local y comenzar el desarrollo en QUANTIFY:</p>
        
        <h3>Paso 1: Instalación de Dependencias</h3>
        <p>Acceda a la carpeta principal del backend e instale los paquetes de Node requeridos mediante el gestor de paquetes de npm:</p>
        <pre><code><span class="c-comment"># Navegar al directorio e instalar dependencias</span>
<span class="c-keyword">cd</span> backend
<span class="c-keyword">npm</span> install</code></pre>

        <h3>Paso 2: Creación de la Base de Datos Relacional</h3>
        <p>Inicie sesión en su terminal de MySQL local y ejecute la sentencia de creación para la base de datos de QUANTIFY:</p>
        <pre><code><span class="c-keyword">CREATE DATABASE</span> quantify_db <span class="c-keyword">CHARACTER SET</span> utf8mb4 <span class="c-keyword">COLLATE</span> utf8mb4_unicode_ci;</code></pre>

        <h3>Paso 3: Inicio de Servidor de Desarrollo</h3>
        <p>Inicie el servidor local en modo recarga automática para reflejar cambios al instante mediante Nodemon:</p>
        <pre><code><span class="c-keyword">npm run</span> dev</code></pre>

        <div class="callout callout-tip">
            <div class="callout-title">Salida Consola Exitosa</div>
            <p style="font-size: 9pt; margin-bottom: 0;">Si la conexión a ambas bases de datos se realiza con éxito, observará lo siguiente en su consola:<br>
            <code>✅ Database models synchronized (MySQL).</code><br>
            <code>🚀 Server running on port 5000</code>
            </p>
        </div>
    </div>

    <!-- SECCION 5 -->
    <div class="page">
        <h1 class="section-title">5. Despliegue con PM2</h1>
        <p>Para asegurar un entorno de alta disponibilidad tradicional en un VPS o servidor dedicado, se utiliza <strong>PM2</strong>. Este administrador de procesos permite ejecutar Node.js en clústeres, maximizando el uso de la CPU y manejando reinicios automáticos ante fallas imprevistas.</p>
        
        <h2>Estructura de ecosystem.config.cjs</h2>
        <p>Cree el siguiente archivo de configuración de PM2 en el directorio raíz de la API:</p>
        
        <pre><code><span class="c-keyword">module</span>.<span class="c-keyword">exports</span> = {
  <span class="c-keyword">apps</span>: [{
    <span class="c-keyword">name</span>: <span class="c-string">'quantify-backend'</span>,
    <span class="c-keyword">script</span>: <span class="c-string">'server.js'</span>,
    <span class="c-keyword">instances</span>: <span class="c-string">'max'</span>, <span class="c-comment">// Crea tantos procesos como hilos de CPU tenga el servidor</span>
    <span class="c-keyword">exec_mode</span>: <span class="c-string">'cluster'</span>, <span class="c-comment">// Balanceo de carga nativo</span>
    <span class="c-keyword">env_production</span>: {
      <span class="c-keyword">NODE_ENV</span>: <span class="c-string">'production'</span>,
      <span class="c-keyword">PORT</span>: <span class="c-number">5000</span>
    },
    <span class="c-keyword">max_memory_restart</span>: <span class="c-string">'800M'</span>,
    <span class="c-keyword">error_file</span>: <span class="c-string">'./logs/pm2-err.log'</span>,
    <span class="c-keyword">out_file</span>: <span class="c-string">'./logs/pm2-out.log'</span>,
    <span class="c-keyword">time</span>: <span class="c-keyword">true</span>
  }]
};</code></pre>

        <h2>Comandos de Control y Despliegue</h2>
        <p>Utilice la siguiente serie de comandos SSH en su servidor de producción para operar PM2:</p>
        <ul>
            <li><strong>Lanzamiento:</strong> <code>pm2 start ecosystem.config.cjs --env production</code></li>
            <li><strong>Listado de Procesos:</strong> <code>pm2 list</code></li>
            <li><strong>Monitoreo de Consumos:</strong> <code>pm2 monit</code></li>
            <li><strong>Ver logs en tiempo real:</strong> <code>pm2 logs quantify-backend</code></li>
            <li><strong>Persistencia tras reinicio:</strong> <code>pm2 startup</code> seguido de <code>pm2 save</code></li>
        </ul>
    </div>

    <!-- SECCION 6 -->
    <div class="page">
        <h1 class="section-title">6. Despliegue Containerizado</h1>
        <p>La contenedorización permite aislar la aplicación con todas sus dependencias exactas, garantizando que el software funcione de manera idéntica en cualquier servidor de producción.</p>

        <h2>Dockerfile del Backend</h2>
        <pre><code><span class="c-keyword">FROM</span> node:20-alpine
<span class="c-keyword">WORKDIR</span> /usr/src/app
<span class="c-keyword">COPY</span> package*.json ./
<span class="c-keyword">RUN</span> npm ci --only=production
<span class="c-keyword">COPY</span> . .
<span class="c-keyword">EXPOSE</span> 5000
<span class="c-keyword">CMD</span> ["node", "--no-deprecation", "server.js"]</code></pre>

        <h2>Orquestación Completa (docker-compose.yml)</h2>
        <pre style="padding: 0.8rem; margin: 0.8rem 0;"><code style="font-size: 7.5pt; line-height: 1.25;"><span class="c-keyword">version</span>: '3.8'
<span class="c-keyword">services</span>:
  <span class="c-keyword">backend</span>:
    <span class="c-keyword">build</span>: .
    <span class="c-keyword">ports</span>:
      - "5000:5000"
    <span class="c-keyword">environment</span>:
      - NODE_ENV=production
      - MYSQL_HOST=mysql-db
      - MONGO_URI=mongodb://mongo-db:27017/quantify_logs
    <span class="c-keyword">depends_on</span>:
      - mysql-db
      - mongo-db
    <span class="c-keyword">restart</span>: always
  <span class="c-keyword">mysql-db</span>:
    <span class="c-keyword">image</span>: mysql:8.0
    <span class="c-keyword">ports</span>:
      - "3306:3306"
    <span class="c-keyword">environment</span>:
      MYSQL_ROOT_PASSWORD: RootPasswordSecure2026
      MYSQL_DATABASE: quantify_db
    <span class="c-keyword">volumes</span>:
      - mysql_data:/var/lib/mysql
  <span class="c-keyword">mongo-db</span>:
    <span class="c-keyword">image</span>: mongo:6.0
    <span class="c-keyword">ports</span>:
      - "27017:27017"
    <span class="c-keyword">volumes</span>:
      - mongo_data:/data/db
<span class="c-keyword">volumes</span>:
  <span class="c-keyword">mysql_data</span>:
  <span class="c-keyword">mongo_data</span>:</code></pre>
    </div>

    <!-- SECCION 7 -->
    <div class="page">
        <h1 class="section-title">7. Configuración de Nginx & SSL</h1>
        <p>Nginx actúa como proxy inverso frente a la API de Node.js, encargándose de gestionar las conexiones de red externas, filtrar tráfico malicioso y cifrar los datos bajo el protocolo SSL (HTTPS).</p>

        <h2>Configuración del Virtual Host</h2>
        <p>Guarde la siguiente estructura de configuración en su archivo de Nginx (habitualmente en <code>/etc/nginx/sites-available/quantify</code>):</p>

        <pre style="padding: 0.8rem; margin: 0.8rem 0;"><code style="font-size: 7.5pt; line-height: 1.25;"><span class="c-keyword">server</span> {
    <span class="c-keyword">listen</span> 80;
    <span class="c-keyword">server_name</span> api.quantifyapp.com;
    <span class="c-keyword">return</span> 301 https://$host$request_uri; <span class="c-comment"># Fuerza HTTPS</span>
}

<span class="c-keyword">server</span> {
    <span class="c-keyword">listen</span> 443 ssl http2;
    <span class="c-keyword">server_name</span> api.quantifyapp.com;

    <span class="c-keyword">ssl_certificate</span> /etc/letsencrypt/live/api.quantifyapp.com/fullchain.pem;
    <span class="c-keyword">ssl_certificate_key</span> /etc/letsencrypt/live/api.quantifyapp.com/privkey.pem;

    <span class="c-keyword">location</span> / {
        <span class="c-keyword">proxy_pass</span> http://127.0.0.1:5000; <span class="c-comment"># Redirige a Express</span>
        <span class="c-keyword">proxy_http_version</span> 1.1;
        <span class="c-keyword">proxy_set_header</span> Upgrade $http_upgrade;
        <span class="c-keyword">proxy_set_header</span> Connection 'upgrade';
        <span class="c-keyword">proxy_set_header</span> Host $host;
        <span class="c-keyword">proxy_set_header</span> X-Real-IP $remote_addr;
        <span class="c-keyword">proxy_set_header</span> X-Forwarded-For $proxy_add_x_forwarded_for;
        <span class="c-keyword">proxy_set_header</span> X-Forwarded-Proto $scheme;
    }
}</code></pre>

        <h2>Habilitar e Instalar Certificados SSL</h2>
        <p>Una vez creado el archivo, enlace la configuración y solicite el certificado Let's Encrypt mediante Certbot:</p>
        <pre><code><span class="c-comment"># Enlazar y verificar configuración</span>
<span class="c-keyword">ln -s</span> /etc/nginx/sites-available/quantify /etc/nginx/sites-enabled/
<span class="c-keyword">nginx</span> -t
<span class="c-keyword">systemctl</span> restart nginx

<span class="c-comment"># Obtener certificado SSL automáticamente</span>
<span class="c-keyword">certbot</span> --nginx -d api.quantifyapp.com</code></pre>
    </div>

    <!-- SECCION 8 -->
    <div class="page">
        <h1 class="section-title">8. Mantenimiento y Respaldos</h1>
        <p>La estabilidad post-despliegue se sostiene mediante políticas rigurosas de copias de seguridad de datos y monitoreo proactivo de la salud de los servicios.</p>

        <h2>Verificación de Salud Proactiva (Health Endpoint)</h2>
        <p>El backend de QUANTIFY expone un endpoint <code>/api/health</code>. Este responde con un estado HTTP <code>200</code> indicando la conectividad del servidor.</p>
        <p>Se recomienda registrar este endpoint en soluciones de monitoreo automatizado (como Uptime Kuma, New Relic o Datadog) para alertar instantáneamente en caso de una caída de servicio.</p>

        <h2>Copias de Seguridad (Cron Jobs Automatizados)</h2>
        <p>Configure tareas programadas en el sistema operativo Linux mediante <code>crontab -e</code> para crear copias de seguridad de las bases de datos de MySQL y MongoDB de manera recurrente:</p>

        <pre><code><span class="c-comment"># Respaldar MySQL diariamente a las 2:00 AM (comprimido en Gzip)</span>
0 2 * * * mysqldump -u root -p'TuPasswordSeguro' quantify_db | gzip > /opt/backups/mysql/quantify_db_$(date +\%F).sql.gz

<span class="c-comment"># Respaldar MongoDB diariamente a las 2:30 AM</span>
30 2 * * * mongodump --uri="mongodb://localhost:27017/quantify_logs" --archive=/opt/backups/mongo/quantify_logs_$(date +\%F).archive --gzip</code></pre>

        <div class="callout callout-tip">
            <div class="callout-title">Recomendación de Almacenamiento</div>
            <p style="font-size: 9pt; margin-bottom: 0;">Para cumplir con estándares internacionales de recuperación ante desastres (DRP), se aconseja programar un script adicional en bash para subir de forma encriptada los archivos resultantes <code>.sql.gz</code> y <code>.archive</code> a buckets de la nube (como AWS S3, Google Cloud Storage o Azure Blob) cada semana.</p>
        </div>
    </div>

    <!-- SECCION 9 -->
    <div class="page">
        <h1 class="section-title">9. Resolución de Problemas</h1>
        <p>Guía rápida para diagnosticar y mitigar los errores operativos más frecuentes durante e inmediatamente después del despliegue del backend:</p>

        <h3>1. Puerto 5000 ya ocupado (EADDRINUSE)</h3>
        <ul>
            <li><strong>Causa:</strong> Una sesión colgada de la aplicación o un proceso ajeno está monopolizando el puerto de la API.</li>
            <li><strong>Solución en Linux:</strong> Matar el proceso asignado en el puerto: <br><code>fuser -k 5000/tcp</code></li>
            <li><strong>Solución en Windows (PowerShell):</strong> Localizar y forzar el cierre:<br><code>Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force</code></li>
        </ul>

        <h3>2. SequelizeConnectionRefusedError (Conexión fallida a MySQL)</h3>
        <ul>
            <li><strong>Causa:</strong> Las credenciales de acceso son erróneas, el servidor no está corriendo, o existe un cortafuegos activo en el puerto 3306.</li>
            <li><strong>Acción correctiva:</strong> Verifique el estado del servicio: <code>systemctl status mysql</code> en Linux. Compruebe la concordancia de contraseñas de producción definidas en el archivo <code>.env</code>.</li>
        </ul>

        <h3>3. Fallo de Conexión en MongoDB Atlas (Timeouts)</h3>
        <ul>
            <li><strong>Causa:</strong> La dirección IP pública del servidor web de producción no ha sido añadida en las políticas de seguridad de la red en el clúster de Atlas.</li>
            <li><strong>Acción correctiva:</strong> Acceda al panel web de Atlas, navegue a <strong>Security -> Network Access</strong>, y añada la IP pública de su servidor actual o habilite accesos globales temporales si es necesario.</li>
        </ul>
    </div>

</body>
</html>
`;

// 1. Write the HTML file to docs directory
const htmlFilePath = path.join(__dirname, 'manual-despliegue-api.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log('✅ HTML template file created successfully.');

// 2. Define the PDF file path
const pdfFilePath = path.join(__dirname, 'manual-despliegue-api.pdf');

// 3. Compile to PDF using Microsoft Edge in headless mode
try {
    const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
    // Edge arguments to generate the PDF
    const cmd = '"' + edgePath + '" --headless=old --disable-gpu --no-pdf-header-footer --print-to-pdf="' + pdfFilePath + '" "file:///' + htmlFilePath.replace(/\\/g, '/') + '"';
    
    console.log('⌛ Generating PDF via headless Microsoft Edge...');
    execSync(cmd);
    console.log('✅ PDF manual generated successfully at: ' + pdfFilePath);
} catch (error) {
    console.error('❌ Failed to compile PDF using Microsoft Edge:', error.message);
    process.exit(1);
}
