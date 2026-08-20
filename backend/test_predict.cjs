const { execFile } = require('child_process');
const path = require('path');

const PREDICT_SCRIPT = path.join(__dirname, 'ml/predict.py');

const data = {
    "edad": 25,
    "dias_activo": 10,
    "tasa_adherencia": 0.8,
    "friccion_promedio": 1.2,
    "racha_maxima": 5,
    "frecuencia_fallo_semanal": 0.5,
    "tendencia_crecimiento": 0.1,
    "horas_sueno": 7.5,
    "pasos_diarios": 5000,
    "fc_media": 70,
    "spo2_promedio": 95,
    "nivel_estres": 1,
    "indice_riesgo_compuesto": 0.5,
    "ratio_adherencia_friccion": 0.6,
    "eficiencia_racha": 0.7,
    "genero_Femenino": 0,
    "genero_Masculino": 1,
    "genero_No Binario": 0,
    "disp_Smartwatch": 1,
    "disp_Web": 0,
    "disp_Web+Smartwatch": 0
};

execFile('python', [PREDICT_SCRIPT, 'full', JSON.stringify(data)], (error, stdout, stderr) => {
    if (error) console.error("Error:", error.message);
    if (stderr) console.error("Stderr:", stderr);
    console.log("Stdout:", stdout);
});
