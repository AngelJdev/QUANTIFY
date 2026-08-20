import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCpu, FiTrendingUp, FiZap, FiRefreshCw, FiUserCheck, FiAlertTriangle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [prediction, setPrediction] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        let socketInstance;
        // Inicializamos Sockets
        import('../services/socket').then(({ initSocket }) => {
            if (user?.id) {
                socketInstance = initSocket(user.id);
                setSocketConnected(true);
                
                // Escuchar el evento en tiempo real
                socketInstance.on('ml_prediction_updated', (data) => {
                    console.log("Real-time ML data received:", data);
                    setPrediction(data);
                    setIsSimulating(false);
                });
            }
        });

        return () => {
            if (socketInstance) {
                socketInstance.off('ml_prediction_updated');
            }
        };
    }, [user]);

    const simulateTelemetry = async () => {
        setIsSimulating(true);
        // Telemetría sintética basada en el feature_config.json
        const syntheticData = {
            "edad": Math.floor(Math.random() * (40 - 18 + 1) + 18),
            "dias_activo": Math.floor(Math.random() * 30),
            "tasa_adherencia": Math.random().toFixed(2),
            "friccion_promedio": (Math.random() * 3).toFixed(2),
            "racha_maxima": Math.floor(Math.random() * 15),
            "frecuencia_fallo_semanal": (Math.random() * 2).toFixed(1),
            "tendencia_crecimiento": (Math.random() * 0.5 - 0.2).toFixed(2),
            "horas_sueno": (Math.random() * 3 + 5).toFixed(1),
            "pasos_diarios": Math.floor(Math.random() * 8000 + 2000),
            "fc_media": Math.floor(Math.random() * 40 + 60),
            "spo2_promedio": Math.floor(Math.random() * 5 + 93),
            "nivel_estres": Math.floor(Math.random() * 3),
            "indice_riesgo_compuesto": (Math.random() * 2).toFixed(2),
            "ratio_adherencia_friccion": Math.random().toFixed(2),
            "eficiencia_racha": Math.random().toFixed(2),
            "genero_Femenino": 0,
            "genero_Masculino": 1,
            "genero_No Binario": 0,
            "disp_Smartwatch": 1,
            "disp_Web": 0,
            "disp_Web+Smartwatch": 0
        };

        try {
            // Hacemos POST a nuestro nuevo endpoint
            await api.post('/ml/full-profile', syntheticData);
            // No hacemos setPrediction aqui. Esperamos a que el Socket.IO nos responda para probar el punto 14 real.
        } catch (error) {
            console.error("Error simulando telemetría", error);
            setIsSimulating(false);
        }
    };

    const getRiskColor = (riesgo) => {
        if (riesgo === "0") return "text-success border-success/30 bg-success/10";
        if (riesgo === "1") return "text-orange-500 border-orange-500/30 bg-orange-500/10";
        if (riesgo === "2") return "text-danger border-danger/30 bg-danger/10";
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    };

    const getRiskLabel = (riesgo) => {
        if (riesgo === "0") return "Bajo Riesgo";
        if (riesgo === "1") return "Riesgo Medio";
        if (riesgo === "2") return "Alto Riesgo (Burnout Inminente)";
        return "Desconocido";
    };

    return (
        <div className="w-full space-y-8 fade-in pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <FiCpu className="text-blue-500" />
                        Analítica Inteligente
                    </h1>
                    <p className="text-textMuted text-sm font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-success' : 'bg-gray-400'} animate-pulse`}></span>
                        {socketConnected ? 'Motor Predictivo Conectado via Socket.IO' : 'Conectando Motor...'}
                    </p>
                </div>
                <button 
                    onClick={simulateTelemetry} 
                    disabled={isSimulating || !socketConnected}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                    <FiActivity className={isSimulating ? "animate-pulse" : ""} />
                    {isSimulating ? 'Calculando Inferencia...' : 'Simular Pulso WearOS'}
                </button>
            </header>

            <AnimatePresence mode="wait">
                {!prediction && !isSimulating ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="glass-card flex flex-col items-center justify-center p-12 text-center h-[400px] border-dashed border-2 dark:border-white/10"
                    >
                        <FiZap className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-2">Esperando Telemetría</h3>
                        <p className="text-gray-400 dark:text-gray-500 max-w-md">
                            Presiona el botón superior para simular un envío de datos desde tu Smartwatch. El modelo predictivo K-Means y Random Forest analizará los datos en tiempo real.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Tarjeta Supervisada */}
                        <div className={`glass-card relative overflow-hidden transition-all duration-700 ${prediction ? getRiskColor(prediction.riesgo_abandono) : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            {isSimulating && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <FiRefreshCw className="animate-spin text-4xl text-primary" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-8 relative z-0">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                                        <FiTrendingUp /> Modelo Supervisado (Random Forest)
                                    </h3>
                                    <p className="text-3xl font-black mt-2">Riesgo de Abandono</p>
                                </div>
                                <FiAlertTriangle className="text-5xl opacity-20" />
                            </div>
                            
                            {prediction && (
                                <div className="text-center relative z-0 mt-8">
                                    <div className="text-6xl font-black mb-2 tracking-tighter">
                                        {getRiskLabel(prediction.riesgo_abandono)}
                                    </div>
                                    <p className="text-sm font-bold opacity-80">
                                        Precisión del Diagnóstico: <span className="font-black text-lg">{(prediction.confianza_riesgo * 100).toFixed(1)}%</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tarjeta No Supervisada */}
                        <div className="glass-card relative overflow-hidden transition-all duration-700 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                            {isSimulating && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <FiRefreshCw className="animate-spin text-4xl text-indigo-500" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-8 relative z-0">
                                <div>
                                    <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <FiUserCheck /> Modelo No Supervisado (K-Means)
                                    </h3>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">Arquetipo de Usuario</p>
                                </div>
                            </div>
                            
                            {prediction && (
                                <div className="text-center relative z-0 mt-8">
                                    <div className="text-4xl md:text-5xl font-black mb-2 text-indigo-600 dark:text-indigo-400">
                                        {prediction.arquetipo}
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                        Asignado al Cluster #{prediction.cluster_id} basado en 15 variables de biometría y consistencia.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalyticsPage;
