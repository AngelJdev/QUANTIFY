import express from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to the python script
const PREDICT_SCRIPT = path.join(__dirname, '../../ml/predict.py');

/**
 * Helper function to run the python script
 */
const runPythonPredict = (type, data) => {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        
        execFile('python', [PREDICT_SCRIPT, type, jsonData], (error, stdout, stderr) => {
            if (error) {
                console.error(`Python Execution Error: ${error}`);
                console.error(`Stderr: ${stderr}`);
                return reject(new Error('Fallo al ejecutar el modelo de Machine Learning.'));
            }
            
            try {
                const result = JSON.parse(stdout);
                if (result.error) {
                    return reject(new Error(result.error));
                }
                resolve(result);
            } catch (parseError) {
                console.error(`JSON Parse Error: ${parseError} on stdout: ${stdout}`);
                reject(new Error('Respuesta inválida del modelo de Machine Learning.'));
            }
        });
    });
};

/**
 * @swagger
 * /api/ml/predict-burnout:
 *   post:
 *     summary: Endpoint Supervisado - Clasificador de Burnout (Random Forest)
 *     description: Retorna el nivel de riesgo de abandono basado en 21 variables predictivas.
 *     tags: [Machine Learning]
 */
router.post('/predict-burnout', verifyToken, async (req, res) => {
    try {
        const data = req.body;
        // Basic validation
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'Se requiere el payload con las variables.' });
        }

        const result = await runPythonPredict('burnout', data);
        
        // Emitir al socket si existe
        const io = req.app.get('io');
        if (io && req.user?.id) {
            io.to(`user_${req.user.id}`).emit('ml_prediction_updated', result);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/ml/predict-archetype:
 *   post:
 *     summary: Endpoint No Supervisado - Arquetipos de Usuario (K-Means)
 *     description: Segmenta al usuario en un cluster basado en sus variables numéricas.
 *     tags: [Machine Learning]
 */
router.post('/predict-archetype', verifyToken, async (req, res) => {
    try {
        const data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'Se requiere el payload con las variables.' });
        }

        const result = await runPythonPredict('archetype', data);
        
        const io = req.app.get('io');
        if (io && req.user?.id) {
            io.to(`user_${req.user.id}`).emit('ml_prediction_updated', result);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/ml/full-profile:
 *   post:
 *     summary: Perfil Completo ML
 *     description: Ejecuta ambos modelos simultáneamente.
 *     tags: [Machine Learning]
 */
router.post('/full-profile', verifyToken, async (req, res) => {
    try {
        const data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'Se requiere el payload.' });
        }

        const result = await runPythonPredict('full', data);

        const io = req.app.get('io');
        if (io && req.user?.id) {
            io.to(`user_${req.user.id}`).emit('ml_prediction_updated', result);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
