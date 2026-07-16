import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/external/github/{username}:
 *   get:
 *     summary: Web Service Externo 2 - GitHub API (Validador de Hábitos de Código)
 *     description: Consulta la API de GitHub para verificar si el usuario hizo commits hoy, sirviendo como validador automático de rachas para programadores.
 *     tags: [External]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Usuario de GitHub
 *     responses:
 *       200:
 *         description: Estado de la actividad del usuario en GitHub
 */
router.get('/github/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // GitHub Events API para verificar actividad pública reciente
        const response = await fetch(`https://api.github.com/users/${username}/events/public`);
        
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Usuario no encontrado o error en GitHub API' });
        }
        
        const events = await response.json();
        // Filtramos eventos de tipo PushEvent (commits)
        const pushEvents = events.filter(event => event.type === 'PushEvent');
        
        res.status(200).json({
            success: true,
            source: 'GitHub Public API',
            habit_validated: pushEvents.length > 0,
            total_commits_recent: pushEvents.length,
            latest_activity: pushEvents.length > 0 ? pushEvents[0].created_at : null
        });
    } catch (error) {
        console.error('Error fetching GitHub API:', error);
        res.status(500).json({ success: false, message: 'Error de conexión con GitHub' });
    }
});

/**
 * @swagger
 * /api/external/telemetry/location:
 *   get:
 *     summary: Web Service Externo 3 - IP Geolocation (Telemetría de contexto)
 *     description: Obtiene la zona horaria y ubicación del usuario basado en su IP pública, usado para registrar el contexto físico al momento de completar un hábito.
 *     tags: [External]
 *     responses:
 *       200:
 *         description: Datos de telemetría de ubicación
 */
router.get('/telemetry/location', async (req, res) => {
    try {
        // Obtenemos la IP real (útil si pasa por proxys)
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        
        // Usamos la API pública de IP-API para telemetría
        const queryIp = clientIp === '::1' || clientIp === '127.0.0.1' ? '' : clientIp; 
        const response = await fetch(`http://ip-api.com/json/${queryIp}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            res.status(200).json({
                success: true,
                source: 'IP-API Geolocation',
                telemetry: {
                    country: data.country,
                    region: data.regionName,
                    timezone: data.timezone,
                    isp: data.isp,
                    lat: data.lat,
                    lon: data.lon
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'No se pudo geolocalizar la IP' });
        }
    } catch (error) {
        console.error('Error fetching IP-API:', error);
        res.status(500).json({ success: false, message: 'Error de conexión con servicio de geolocalización' });
    }
});

export default router;
