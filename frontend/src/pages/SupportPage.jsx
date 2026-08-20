import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend,
    FiAlertCircle,
    FiCheckCircle,
    FiHelpCircle,
    FiMessageSquare,
    FiSearch,
    FiClock,
    FiChevronDown,
    FiChevronUp,
    FiUser,
    FiShield,
    FiRefreshCw,
    FiInbox
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const FAQ_DATA = [
    {
        id: 1,
        categoria: 'Cuenta y Perfil',
        pregunta: '¿Cómo cambio mi contraseña o correo electrónico?',
        respuesta: 'Dirígete a la sección "Mi Perfil" en el menú lateral. En el apartado de Seguridad puedes actualizar tu nombre, foto de perfil o solicitar un cambio de correo electrónico protegido mediante código de verificación.'
    },
    {
        id: 2,
        categoria: 'Cuenta y Perfil',
        pregunta: '¿Cómo funciona el nivel de usuario y los puntos de experiencia (XP)?',
        respuesta: 'Ganas puntos de experiencia (XP) cada vez que completas tus hábitos diarios o desbloqueas logros. A medida que acumulas XP, subes de nivel y tu rango en la tabla de clasificación de la comunidad aumenta.'
    },
    {
        id: 3,
        categoria: 'Cuenta y Perfil',
        pregunta: '¿Puedo eliminar mi cuenta o descargar mis datos personales?',
        respuesta: 'Sí, en "Mi Perfil" -> "Privacidad" puedes solicitar una copia completa de tus datos de actividad en formato JSON o proceder con la eliminación definitiva e irreversible de tu cuenta.'
    },
    {
        id: 4,
        categoria: 'Hábitos y Rachas',
        pregunta: '¿Cómo se calcula mi racha diaria (Streak)?',
        respuesta: 'Tu racha aumenta +1 cada día consecutivo que inicias sesión y registras el cumplimiento de tus hábitos. Si dejas pasar un día completo sin ingresar, tu racha actual se reiniciará a 1, pero mantendremos tu racha máxima histórica.'
    },
    {
        id: 5,
        categoria: 'Hábitos y Rachas',
        pregunta: '¿Qué sucede si olvido marcar un hábito de ayer?',
        respuesta: 'El sistema permite un margen de registro retroactivo de hasta 24 horas para evitar romper injustamente tu constancia diaria, siempre que tengas la función de tolerancia habilitada en tu configuración.'
    },
    {
        id: 6,
        categoria: 'Hábitos y Rachas',
        pregunta: '¿Cuál es la diferencia entre un hábito cuantitativo y uno booleano?',
        respuesta: 'Un hábito booleano requiere un simple "Cumplido/No Cumplido" (ej. Meditar). Un hábito cuantitativo mide métricas exactas como litros de agua, kilómetros recorridos u horas de sueño.'
    },
    {
        id: 7,
        categoria: 'Smartwatch y TV',
        pregunta: '¿Cómo vinculo mi Smartwatch o Smart TV a Quantify?',
        respuesta: 'Abre la app de Quantify en tu Smartwatch o Smart TV para obtener un código de 6 caracteres. Luego, en la app Web ve a "Smartwatch" e ingresa el código para activar la sincronización automática en tiempo real.'
    },
    {
        id: 8,
        categoria: 'Smartwatch y TV',
        pregunta: '¿Qué datos biométricos se sincronizan desde mi Smartwatch?',
        respuesta: 'Quantify mide en tiempo real tus pasos diarios, ritmo cardíaco promedio (BPM), minutos de actividad física intensa, calorías quemadas y horas de sueño profundo.'
    },
    {
        id: 9,
        categoria: 'Smartwatch y TV',
        pregunta: '¿Qué puedo hacer desde la aplicación para Smart TV?',
        respuesta: 'La versión para Smart TV está diseñada como un tablero de control continuo en pantalla grande, ideal para ver tus rachas del mes, gráficas de rendimiento y el ranking de desafíos con amigos en tiempo real.'
    },
    {
        id: 10,
        categoria: 'Inteligencia Artificial',
        pregunta: '¿Qué es el Quantify Intelligence Agent?',
        respuesta: 'Es nuestro motor de IA potenciado por Gemini. Analiza el nombre de cualquier hábito que desees crear y genera la configuración óptima (meta diaria, unidad, frecuencia recomendada) descartando hábitos no saludables.'
    },
    {
        id: 11,
        categoria: 'Inteligencia Artificial',
        pregunta: '¿Cómo funciona el análisis biométrico predictivo?',
        respuesta: 'Nuestra IA cruza tus patrones de sueño y nivel de estrés del reloj inteligente con tus hábitos completados para sugerirte el mejor horario de entrenamiento o descanso del día.'
    },
    {
        id: 12,
        categoria: 'Comunidad y Desafíos',
        pregunta: '¿Cómo me uno a un desafío comunitario o creo uno nuevo?',
        respuesta: 'Ve a la sección "Comunidad" en el menú principal. Allí puedes unirte a desafíos globales creados por la comunidad o crear tus propios retos privados para competir con tus amigos.'
    },
    {
        id: 13,
        categoria: 'Comunidad y Desafíos',
        pregunta: '¿Cómo funcionan las reacciones e interacciones en el Feed?',
        respuesta: 'Puedes felicitar a tus amigos en el Feed enviando reacciones en tiempo real o comentando sus logros obtenidos para motivarlos a mantener su racha.'
    },
    {
        id: 14,
        categoria: 'Pagos y Premium',
        pregunta: '¿Qué beneficios incluye la membresía Quantify Premium?',
        respuesta: 'Acceso ilimitado a análisis biométricos avanzados con IA, exportación de reportes de rendimiento, sincronización prioritaria con Smartwatch/Smart TV y desbloqueo de insignias exclusivas en tu perfil.'
    },
    {
        id: 15,
        categoria: 'Pagos y Premium',
        pregunta: '¿Puedo cancelar mi suscripción Premium en cualquier momento?',
        respuesta: 'Absolutamente. Puedes cancelar el cobro recurrente desde la configuración de tu cuenta en cualquier momento sin penalizaciones y mantendrás tus beneficios hasta el final del ciclo facturado.'
    }
];

const STATUS_BADGES = {
    'Abierto': { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: FiClock },
    'En Proceso': { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: FiRefreshCw },
    'Resuelto': { bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', icon: FiCheckCircle },
    'Cerrado': { bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30', icon: FiAlertCircle }
};

const PRIORITY_BADGES = {
    'Baja': 'text-gray-600 dark:text-gray-300 border-gray-500/30 bg-gray-500/10',
    'Media': 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10',
    'Alta': 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10',
    'Urgente': 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10'
};

const SupportPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('NEW_TICKET'); // 'NEW_TICKET', 'MY_TICKETS', 'FAQ'

    // Estado del Formulario
    const [formData, setFormData] = useState({
        asunto: '',
        email: user?.email || '',
        mensaje: '',
        prioridad: 'Media'
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdTicket, setCreatedTicket] = useState(null);

    // Estado de Mis Tickets
    const [myTickets, setMyTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState(null);

    // Estado de FAQ
    const [faqSearch, setFaqSearch] = useState('');
    const [selectedFaqCategory, setSelectedFaqCategory] = useState('Todas');
    const [openFaqId, setOpenFaqId] = useState(null);

    // Cargar email por defecto si cambia el usuario
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    // Escuchar parámetros URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'my-tickets') setActiveTab('MY_TICKETS');
        if (tab === 'faq') setActiveTab('FAQ');
    }, [searchParams]);

    // Cargar tickets del usuario
    const fetchMyTickets = async () => {
        setLoadingTickets(true);
        try {
            const res = await api.get('/support/my-tickets');
            if (res.data?.data?.tickets) {
                setMyTickets(res.data.data.tickets);
            }
        } catch (err) {
            console.error('Error al cargar tickets:', err);
        } finally {
            setLoadingTickets(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'MY_TICKETS') {
            fetchMyTickets();
        }
    }, [activeTab]);

    // Sockets en tiempo real para actualizar mis tickets
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        if (user?.id) {
            socket.emit('join_user_room', user.id);
        }

        socket.on('support:ticket-updated', () => {
            fetchMyTickets();
        });

        socket.on('support:ticket-created', () => {
            fetchMyTickets();
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Validaciones
    const validate = (name, value) => {
        let error = '';
        if (name === 'asunto') {
            if (!value) error = 'El asunto es obligatorio.';
            else if (value.length < 5) error = 'Mínimo 5 caracteres.';
        }
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'El correo es obligatorio.';
            else if (!emailRegex.test(value)) error = 'Correo con formato inválido.';
        }
        if (name === 'mensaje') {
            if (!value) error = 'El mensaje no puede estar vacío.';
            else if (value.length < 20) error = 'Mínimo 20 caracteres descripciones precisas.';
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touched[name]) {
            setErrors({ ...errors, [name]: validate(name, value) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const err = validate(key, formData[key]);
            if (err) newErrors[key] = err;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ asunto: true, email: true, mensaje: true });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/support', formData);
            if (res.data?.status === 'success' || res.data?.data?.ticket) {
                const ticket = res.data.data.ticket || { ticketId: res.data.data.ticketId, asunto: formData.asunto };
                setCreatedTicket(ticket);
                setFormData({ asunto: '', email: user?.email || '', mensaje: '', prioridad: 'Media' });
                setTouched({});
                setErrors({});
            }
        } catch (err) {
            console.error('Error al enviar ticket:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtros de FAQ
    const faqCategories = ['Todas', 'Cuenta y Perfil', 'Hábitos y Rachas', 'Smartwatch y TV', 'Inteligencia Artificial', 'Comunidad y Desafíos', 'Pagos y Premium'];
    const filteredFaqs = FAQ_DATA.filter(faq => {
        if (selectedFaqCategory !== 'Todas' && faq.categoria !== selectedFaqCategory) return false;
        if (faqSearch.trim()) {
            const q = faqSearch.toLowerCase();
            return faq.pregunta.toLowerCase().includes(q) || faq.respuesta.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto py-8 px-4 space-y-8"
        >
            {/* Header Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card border border-blue-500/20 dark:border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 dark:bg-white/10 p-4 rounded-2xl border border-blue-500/20 dark:border-white/20 text-blue-600 dark:text-cyan-400">
                        <FiHelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-textPrimary dark:text-white uppercase tracking-tight">
                            Soporte & Asistencia
                        </h1>
                        <p className="text-sm font-medium text-textMuted dark:text-gray-400">
                            Centro de ingeniería para resolución de incidencias y consultas del sistema Quantify.
                        </p>
                    </div>
                </div>

                {/* Pestañas de Navegación con alto contraste */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 self-stretch md:self-auto">
                    <button
                        onClick={() => { setActiveTab('NEW_TICKET'); setCreatedTicket(null); }}
                        className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'NEW_TICKET'
                                ? 'bg-blue-600 text-white dark:bg-white dark:text-black shadow-lg shadow-blue-500/20 dark:shadow-white/10'
                                : 'text-textMuted dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
                        }`}
                    >
                        <FiSend size={14} /> Crear Ticket
                    </button>
                    <button
                        onClick={() => setActiveTab('MY_TICKETS')}
                        className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'MY_TICKETS'
                                ? 'bg-blue-600 text-white dark:bg-white dark:text-black shadow-lg shadow-blue-500/20 dark:shadow-white/10'
                                : 'text-textMuted dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
                        }`}
                    >
                        <FiMessageSquare size={14} /> Mis Tickets ({myTickets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('FAQ')}
                        className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'FAQ'
                                ? 'bg-blue-600 text-white dark:bg-white dark:text-black shadow-lg shadow-blue-500/20 dark:shadow-white/10'
                                : 'text-textMuted dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
                        }`}
                    >
                        <FiHelpCircle size={14} /> FAQ
                    </button>
                </div>
            </div>

            {/* TAB 1: CREAR TICKET */}
            {activeTab === 'NEW_TICKET' && (
                <div className="max-w-2xl mx-auto">
                    {createdTicket ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card text-center p-8 border border-emerald-500/30 rounded-3xl space-y-6 bg-emerald-500/5"
                        >
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                                <FiCheckCircle size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-textPrimary dark:text-white">
                                    ¡Ticket de Soporte Enviado!
                                </h2>
                                <p className="text-sm text-textMuted dark:text-gray-400 mt-1">
                                    Hemos registrado tu solicitud bajo el código identificador:
                                </p>
                                <div className="mt-4 inline-block px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 font-mono font-black text-xl tracking-wider">
                                    #{createdTicket.ticketId}
                                </div>
                            </div>
                            <p className="text-xs text-textMuted dark:text-gray-400 max-w-md mx-auto">
                                El equipo de soporte técnico revisará tus datos y recibirás una actualización directamente en tu pestaña de "Mis Tickets".
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-2">
                                <button
                                    onClick={() => setActiveTab('MY_TICKETS')}
                                    className="px-6 py-3 bg-blue-600 text-white dark:bg-white dark:text-black font-extrabold text-xs rounded-2xl hover:brightness-110 shadow-lg shadow-blue-500/20 dark:shadow-white/10 transition-all flex items-center gap-2"
                                >
                                    <FiMessageSquare size={16} /> Ver Mis Tickets
                                </button>
                                <button
                                    onClick={() => setCreatedTicket(null)}
                                    className="px-6 py-3 bg-gray-200 dark:bg-white/10 font-bold text-xs text-textPrimary dark:text-white rounded-2xl hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                                >
                                    Enviar Otro Ticket
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 border border-gray-200 dark:border-white/10 rounded-3xl space-y-7 shadow-2xl">
                            <div className="text-center space-y-1 pb-2 border-b border-gray-100 dark:border-white/10">
                                <h2 className="text-2xl font-black text-textPrimary dark:text-white uppercase tracking-tight flex items-center justify-center gap-2">
                                    <FiSend className="text-blue-600 dark:text-cyan-400" /> Registrar Nueva Solicitud
                                </h2>
                                <p className="text-xs font-medium text-textMuted dark:text-gray-400">
                                    Completa los campos a continuación para dar seguimiento a tu caso.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                {/* Asunto */}
                                <div className="space-y-2">
                                    <div className="h-5 flex items-end ml-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                            Asunto del Ticket *
                                        </label>
                                    </div>
                                    <input 
                                        name="asunto"
                                        value={formData.asunto}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Ej: Error al sincronizar pasos"
                                        className={`w-full h-12 px-4 bg-gray-100 dark:bg-white/5 border ${
                                            errors.asunto && touched.asunto ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                        } rounded-2xl text-sm font-medium text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-white transition-all`}
                                    />
                                    {errors.asunto && touched.asunto && (
                                        <p className="text-red-500 text-[11px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-1">
                                            <FiAlertCircle size={12} /> {errors.asunto}
                                        </p>
                                    )}
                                </div>

                                {/* Correo Electrónico */}
                                <div className="space-y-2">
                                    <div className="h-5 flex items-end ml-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                            Correo de Contacto *
                                        </label>
                                    </div>
                                    <input 
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="tu_correo@ejemplo.com"
                                        className={`w-full h-12 px-4 bg-gray-100 dark:bg-white/5 border ${
                                            errors.email && touched.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                        } rounded-2xl text-sm font-medium text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-white transition-all`}
                                    />
                                    {errors.email && touched.email && (
                                        <p className="text-red-500 text-[11px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-1">
                                            <FiAlertCircle size={12} /> {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Prioridad con Botones de Alto Contraste */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400 ml-1 block">
                                    Nivel de Prioridad
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['Baja', 'Media', 'Alta', 'Urgente'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, prioridad: p })}
                                            className={`py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all border ${
                                                formData.prioridad === p
                                                    ? 'bg-blue-600 text-white dark:bg-white dark:text-black border-blue-600 dark:border-white shadow-lg shadow-blue-500/20 dark:shadow-white/10'
                                                    : 'bg-gray-100 dark:bg-white/5 text-textMuted dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-500/40'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mensaje */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                        Descripción Detallada *
                                    </label>
                                    <span className="text-[10px] font-bold text-textMuted dark:text-gray-500">
                                        {formData.mensaje.length} / 500 carac.
                                    </span>
                                </div>
                                <textarea 
                                    name="mensaje"
                                    rows={5}
                                    value={formData.mensaje}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    maxLength={500}
                                    placeholder="Describe qué ocurrió, en qué sección y los pasos para reproducir la situación..."
                                    className={`w-full p-4 bg-gray-100 dark:bg-white/5 border ${
                                        errors.mensaje && touched.mensaje ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                    } rounded-2xl text-sm font-medium text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-white transition-all resize-none`}
                                />
                                {errors.mensaje && touched.mensaje && (
                                    <p className="text-red-500 text-[11px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-1">
                                        <FiAlertCircle size={12} /> {errors.mensaje}
                                    </p>
                                )}
                            </div>

                            {/* Botón de Envío Principal de Alto Contraste */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" size={16} /> Enviando Solicitud...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={16} /> Crear Ticket de Soporte
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* TAB 2: MIS TICKETS */}
            {activeTab === 'MY_TICKETS' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-textPrimary dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <FiMessageSquare className="text-blue-600 dark:text-cyan-400" /> Historial de Mis Tickets
                        </h2>
                        <button
                            onClick={fetchMyTickets}
                            className="p-2.5 bg-gray-100 dark:bg-white/5 text-textMuted hover:text-textPrimary dark:hover:text-white rounded-xl border border-gray-200 dark:border-white/10 transition-all"
                            title="Actualizar lista"
                        >
                            <FiRefreshCw className={loadingTickets ? 'animate-spin' : ''} size={16} />
                        </button>
                    </div>

                    {loadingTickets ? (
                        <div className="glass-card p-12 text-center space-y-4">
                            <FiRefreshCw className="animate-spin text-blue-600 dark:text-cyan-400 mx-auto w-8 h-8" />
                            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Cargando tickets...</p>
                        </div>
                    ) : myTickets.length === 0 ? (
                        <div className="glass-card p-12 text-center space-y-4 border border-dashed border-gray-300 dark:border-white/10">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-textMuted">
                                <FiInbox size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-textPrimary dark:text-white">Sin tickets registrados</h3>
                                <p className="text-xs text-textMuted dark:text-gray-400 mt-1">
                                    No tienes solicitudes de soporte abiertas en este momento.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('NEW_TICKET')}
                                className="px-6 py-2.5 bg-blue-600 text-white dark:bg-white dark:text-black font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-white/10 hover:brightness-110 transition-all inline-flex items-center gap-2"
                            >
                                <FiSend size={14} /> Crear mi primer ticket
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myTickets.map(ticket => {
                                const isExpanded = expandedTicketId === ticket._id || expandedTicketId === ticket.ticketId;
                                const statusInfo = STATUS_BADGES[ticket.status] || STATUS_BADGES['Abierto'];
                                const StatusIcon = statusInfo.icon;
                                const priorityClass = PRIORITY_BADGES[ticket.prioridad] || PRIORITY_BADGES['Media'];

                                return (
                                    <div 
                                        key={ticket._id || ticket.ticketId}
                                        className="glass-card border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all"
                                    >
                                        {/* Barra superior de Ticket */}
                                        <div 
                                            onClick={() => setExpandedTicketId(isExpanded ? null : (ticket._id || ticket.ticketId))}
                                            className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono font-black text-xs text-blue-600 dark:text-cyan-400 bg-blue-500/10 dark:bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 dark:border-cyan-500/20">
                                                        #{ticket.ticketId}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${priorityClass}`}>
                                                        {ticket.prioridad}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${statusInfo.bg}`}>
                                                        <StatusIcon size={10} /> {ticket.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-extrabold text-textPrimary dark:text-white">
                                                    {ticket.asunto}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-textMuted dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <FiClock size={12} />
                                                    {new Date(ticket.createdAt).toLocaleDateString('es-MX', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                                            </div>
                                        </div>

                                        {/* Contenido Desplegable */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-100 dark:border-white/10 p-5 bg-gray-50/50 dark:bg-white/[0.01] space-y-4"
                                                >
                                                    {/* Mensaje enviado */}
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-textMuted dark:text-gray-400 mb-1 flex items-center gap-1">
                                                            <FiUser size={12} /> Tu Mensaje:
                                                        </p>
                                                        <p className="text-sm font-medium text-textPrimary dark:text-gray-200 bg-surface dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-white/5 whitespace-pre-wrap">
                                                            {ticket.mensaje}
                                                        </p>
                                                    </div>

                                                    {/* Respuesta del Admin con colores 100% legibles en modo Claro y Oscuro */}
                                                    {ticket.respuesta_admin ? (
                                                        <div className="border border-emerald-500/30 bg-emerald-500/10 p-4 rounded-xl space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                                                    <FiShield size={12} /> Respuesta de Soporte ({ticket.respondido_por || 'Equipo Quantify'}):
                                                                </p>
                                                                {ticket.fecha_respuesta && (
                                                                    <span className="text-[10px] font-bold text-emerald-800/80 dark:text-emerald-400/80">
                                                                        {new Date(ticket.fecha_respuesta).toLocaleString('es-MX')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap">
                                                                {ticket.respuesta_admin}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                                            <FiClock size={16} />
                                                            <p className="text-xs font-bold">
                                                                Tu ticket está en espera de revisión por el equipo de soporte técnico. Te notificaremos aquí cuando recibas respuesta.
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: PREGUNTAS FRECUENTES (FAQ) */}
            {activeTab === 'FAQ' && (
                <div className="space-y-6">
                    {/* Buscador */}
                    <div className="glass-card p-6 border border-gray-200 dark:border-white/10 rounded-3xl space-y-4">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                            <input 
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                placeholder="Buscar en preguntas frecuentes (ej. racha, contraseña, smartwatch)..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-white transition-all"
                            />
                        </div>

                        {/* Filtro por Categorías */}
                        <div className="flex flex-wrap gap-2">
                            {faqCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedFaqCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        selectedFaqCategory === cat
                                            ? 'bg-blue-600 text-white dark:bg-white dark:text-black border-blue-600 dark:border-white shadow-md shadow-blue-500/20 dark:shadow-white/10'
                                            : 'bg-gray-100 dark:bg-white/5 text-textMuted dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-500/40'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista de FAQs */}
                    <div className="space-y-3">
                        {filteredFaqs.length === 0 ? (
                            <div className="glass-card p-8 text-center text-textMuted">
                                <p className="text-sm font-bold">No se encontraron preguntas que coincidan con tu búsqueda.</p>
                            </div>
                        ) : (
                            filteredFaqs.map(faq => {
                                const isOpen = openFaqId === faq.id;
                                return (
                                    <div 
                                        key={faq.id}
                                        className="glass-card border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all"
                                    >
                                        <button
                                            onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                                            className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                                        >
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-500/10 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 dark:border-cyan-500/20">
                                                    {faq.categoria}
                                                </span>
                                                <h3 className="text-base font-extrabold text-textPrimary dark:text-white">
                                                    {faq.pregunta}
                                                </h3>
                                            </div>
                                            {isOpen ? <FiChevronUp size={18} className="text-textMuted" /> : <FiChevronDown size={18} className="text-textMuted" />}
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-100 dark:border-white/10 p-5 bg-gray-50/50 dark:bg-white/[0.01]"
                                                >
                                                    <p className="text-sm font-medium text-textMuted dark:text-gray-300 leading-relaxed">
                                                        {faq.respuesta}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SupportPage;
