import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const NotificationSettings = () => {
    const options = [
        { id: 1, label: "Alertas de Racha", desc: "Recibe un aviso antes de perder tu racha de hábitos.", status: true },
        { id: 2, label: "Logros Alcanzados", desc: "Notificaciones cuando desbloqueas trofeos.", status: true },
        { id: 3, label: "Resumen Semanal", desc: "Un reporte detallado de tu progreso cada domingo.", status: false },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-accent/20 p-3 rounded-2xl">
                    <FiBell className="text-accent w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Preferencias de Notificación</h2>
                    <p className="text-sm text-textMuted">Controla cómo y cuándo quieres ser contactado.</p>
                </div>
            </div>

            <div className="space-y-4">
                {options.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                        <div>
                            <p className="font-bold text-white">{opt.label}</p>
                            <p className="text-xs text-textMuted">{opt.desc}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${opt.status ? 'bg-accent' : 'bg-gray-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${opt.status ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="mt-8 w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20">
                <FiCheckCircle /> Guardar Cambios
            </button>
        </motion.div>
    );
};

export default NotificationSettings;
