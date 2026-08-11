import { Link } from 'react-router-dom';
import { FiRefreshCw, FiServer } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Error500 = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements for depth */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center text-center"
            >
                <div className="relative mb-10">
                    <motion.div
                        animate={{ 
                            y: [0, -15, 0],
                            rotateX: [0, 20, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="bg-accent/20 p-8 rounded-[2rem] border border-accent/30 backdrop-blur-xl shadow-2xl shadow-accent/10"
                    >
                        <FiServer className="text-accent w-20 h-20" />
                    </motion.div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background border border-accent/30 text-accent text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] whitespace-nowrap shadow-lg">
                        Server Error 500
                    </div>
                </div>

                <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
                    Falla de <span className="text-accent">Sincronía</span>
                </h1>
                
                <h2 className="text-xl md:text-2xl font-medium text-textMuted mb-10 max-w-xl mx-auto">
                    Nuestros servidores están procesando una carga de datos inusual. La conexión se ha interrumpido temporalmente.
                </h2>

                <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                    <button 
                        onClick={handleRefresh}
                        className="flex-1 bg-accent text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all duration-300 shadow-xl shadow-accent/20"
                    >
                        <FiRefreshCw className="animate-spin-slow" />
                        Reintentar Conexión
                    </button>
                    
                    <Link 
                        to="/dashboard" 
                        className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
                
                <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-md">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">
                        Monitor de Estado: <span className="text-danger animate-pulse">Crítico</span>
                    </p>
                </div>
            </motion.div>

            {/* Scanline effect */}
            <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
};

export default Error500;
