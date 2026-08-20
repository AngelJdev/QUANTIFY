import { GoogleGenerativeAI } from '@google/generative-ai';

// Iniciar cliente de Gemini
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const recommendHabitConfig = async (req, res, next) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'La consulta (query) es obligatoria' });
        }

        if (!genAI) {
            return res.status(503).json({ success: false, message: 'La clave de API de Gemini no está configurada.' });
        }

        const systemPrompt = `
Eres el "Quantify Intelligence Agent", un motor interno para una app de seguimiento de hábitos productivos (Quantify).
Tu trabajo es recibir el nombre (y posible descripción) de un hábito que el usuario escribe, y devolver EXCLUSIVAMENTE un objeto JSON con la configuración óptima.

REGLA DE SEGURIDAD (MUY IMPORTANTE):
Si el hábito es autodestructivo (ej. fumar, beber alcohol, drogas), inútil, poco saludable, o simplemente no tiene sentido rastrearlo como un reto de crecimiento (ej. "fiesta", "dormir todo el dia", "insultar"), quiero que tu JSON devuelva ÚNICAMENTE esto:
{ "ai_error": "Hábito no reconocido como productivo o saludable por Quantify Intelligence." }

Reglas del JSON para hábitos VALIDOS:
- "frec": "DIARIO", "SEMANAL" o "PERSONALIZADO" (si es mensual usa PERSONALIZADO).
- "meta": Número (ej. "5", "20", "2.5").
- "uni": (ej. "Días/Semana", "Litros", "Páginas", "Minutos"). Si frec es SEMANAL, usa "Días/Semana".
- "dur": "1_MES", "1_SEMANA", "6_MESES", "1_ANIO" o "1_DIA".
- "desc": Descripción técnica, formal y motivadora (máximo 60 caracteres).
No respondas con saludos ni markdown. SOLO envia texto JSON puro.
`;
        
        let result;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
            result = await model.generateContent(`${systemPrompt}\n\nHabito a analizar: "${query}"`);
        } catch (e) {
            console.warn("gemini-3.6-flash falló, intentando de nuevo...");
            try {
                const modelFallback = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
                result = await modelFallback.generateContent(`${systemPrompt}\n\nHabito a analizar: "${query}"`);
            } catch (e2) {
                console.error("Gemini AI API Error:", e2);
                throw e2;
            }
        }

        const responseText = result.response.text().trim();
        
        // Remove markdown block if model accidentally included it
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Check if parsing fails to avoid server crashes
        let recommendation;
        try {
            recommendation = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Gemini no devolvió un JSON válido:", cleanJson);
            return res.status(500).json({ success: false, message: 'Respuesta de IA inválida.' });
        }

        if (req.user && req.user.id) {
            try {
                const User = (await import('../models/user.model.js')).default;
                const { analyzeAchievements } = await import('../services/gamificationEngine.js');
                const user = await User.findByPk(req.user.id);
                if (user) {
                    const prefs = user.preferencias || {};
                    prefs.used_ai = true;
                    user.preferencias = prefs;
                    await user.changed('preferencias', true);
                    await user.save();
                    analyzeAchievements(user.id, null, 1).catch(console.error);
                }
            } catch (err) {
                console.error('Error registrando uso de IA en perfil:', err);
            }
        }

        res.status(200).json({
            success: true,
            data: recommendation
        });

    } catch (error) {
        console.error('Error in recommendHabitConfig:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al consultar IA' });
    }
};
