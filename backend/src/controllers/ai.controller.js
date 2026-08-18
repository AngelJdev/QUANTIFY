import { GoogleGenerativeAI } from '@google/generative-ai';

// Iniciar cliente de Gemini
// Asume que la clave está guardada en proces.env.GEMINI_API_KEY
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            result = await model.generateContent(`${systemPrompt}\n\nHabito a analizar: "${query}"`);
        } catch (e) {
            console.warn("gemini-1.5-flash falló, intentando de nuevo...");
            try {
                const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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

        res.status(200).json({
            success: true,
            data: recommendation
        });

    } catch (error) {
        console.error('Error in recommendHabitConfig:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al consultar IA' });
    }
};
