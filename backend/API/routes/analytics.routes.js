import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/streak-calculator:
 *   post:
 *     summary: Web Service Propio - Motor Analítico de Rachas
 *     description: Calcula la "Racha Real" (Gamification Engine) evaluando el tiempo de actividad y la penalización por estrés (telemetría), ajustándose al diseño de Quantify System.
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habit_id:
 *                 type: string
 *               current_streak:
 *                 type: integer
 *               stress_level_bpm:
 *                 type: integer
 *                 description: Frecuencia cardíaca media (telemetría)
 *               activity_duration_minutes:
 *                 type: integer
 *             example:
 *               habit_id: "60d5ec49c"
 *               current_streak: 5
 *               stress_level_bpm: 85
 *               activity_duration_minutes: 45
 *     responses:
 *       200:
 *         description: Cálculo completado exitosamente
 *       400:
 *         description: Faltan datos en la petición
 */
router.post('/streak-calculator', (req, res) => {
    const { habit_id, current_streak, stress_level_bpm, activity_duration_minutes } = req.body;

    if (!habit_id || current_streak === undefined || !stress_level_bpm || !activity_duration_minutes) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros de telemetría para calcular la racha.' });
    }

    // Lógica del "Motor de Gamificación" de Quantify
    let new_streak = current_streak;
    let valid_effort = false;
    let message = '';

    // Regla de negocio: Si el nivel de estrés/esfuerzo (BPM) es mayor a 80 y la duración > 30 mins = Racha Válida
    if (stress_level_bpm > 80 && activity_duration_minutes >= 30) {
        valid_effort = true;
        new_streak += 1;
        message = 'Esfuerzo validado por telemetría. Racha incrementada.';
    } else {
        // Penalización por falso positivo ("engañar" a la app como dice el PMBOK)
        new_streak = Math.max(0, current_streak - 1);
        message = 'Penalización: Los datos de telemetría no reflejan el esfuerzo requerido. Racha penalizada.';
    }

    res.status(200).json({
        success: true,
        service: 'Quantify Gamification Engine (Web Service Propio)',
        analytics: {
            habit_id,
            valid_effort,
            old_streak: current_streak,
            new_streak,
            telemetry_received: {
                bpm: stress_level_bpm,
                duration: activity_duration_minutes
            }
        },
        message
    });
});

export default router;
