import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiAlertCircle, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import axios from 'axios';

const SupportPage = () => {
    const [formData, setFormData] = useState({
        asunto: '',
        email: '',
        mensaje: '',
        prioridad: 'Media'
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

    // Validaciones en tiempo real
    const validate = (name, value) => {
        let error = '';
        if (name === 'asunto') {
            if (!value) error = 'El asunto es obligatorio';
            else if (value.length < 5) error = 'Demasiado corto (mín. 5 carac.)';
        }
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'El correo es obligatorio';
            else if (!emailRegex.test(value)) error = 'Formato de correo inválido';
        }
        if (name === 'mensaje') {
            if (!value) error = 'El mensaje no puede estar vacío';
            else if (value.length < 20) error = 'Por favor, sé más descriptivo (mín. 20 carac.)';
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        const error = validate(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Si ya fue tocado, validar mientras escribe
        if (touched[name]) {
            const error = validate(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar todos los campos antes de enviar
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ asunto: true, email: true, mensaje: true });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Manejo de asincronía con Axios
            const response = await axios.post('/api/support', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.status === 'success') {
                setSubmitStatus('success');
                setFormData({ asunto: '', email: '', mensaje: '', prioridad: 'Media' });
                setTouched({});
            }
        } catch (err) {
            console.error('Error al enviar ticket:', err);
            setSubmitStatus('error');
            
            // Si el backend devuelve errores de validación (express-validator)
            if (err.response?.data?.errors) {
                const backendErrors = {};
                err.response.data.errors.forEach(e => {
                    backendErrors[e.field] = e.message;
                });
                setErrors(backendErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto py-10 px-6"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30">
                    <FiHelpCircle className="text-primary w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Soporte Técnico</h1>
                    <p className="text-textMuted font-medium">¿Tienes problemas con tus métricas? Cuéntanos.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo: Asunto */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-textMuted ml-1">Asunto del Ticket</label>
                    <input 
                        name="asunto"
                        value={formData.asunto}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Ej: Error al sincronizar pasos"
                        className={`input-field ${errors.asunto && touched.asunto ? 'border-danger' : ''}`}
                    />
                    <AnimatePresence>
                        {errors.asunto && touched.asunto && (
                            <motion.p 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-danger text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-2"
                            >
                                <FiAlertCircle /> {errors.asunto}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Campo: Email */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-textMuted ml-1">Tu Correo de Contacto</label>
                    <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="usuario@quantify.app"
                        className={`input-field ${errors.email && touched.email ? 'border-danger' : ''}`}
                    />
                    <AnimatePresence>
                        {errors.email && touched.email && (
                            <motion.p 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-danger text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-2"
                            >
                                <FiAlertCircle /> {errors.email}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Campo: Prioridad */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-textMuted ml-1">Prioridad</label>
                    <select 
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                        className="input-field appearance-none"
                    >
                        <option value="Baja">Baja - Consulta general</option>
                        <option value="Media">Media - Fallo funcional</option>
                        <option value="Alta">Alta - Pérdida de datos / Bloqueo</option>
                    </select>
                </div>

                {/* Campo: Mensaje */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-textMuted ml-1">Descripción del Problema</label>
                    <textarea 
                        name="mensaje"
                        rows="4"
                        value={formData.mensaje}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Describe detalladamente qué sucedió..."
                        className={`input-field ${errors.mensaje && touched.mensaje ? 'border-danger' : ''} resize-none`}
                    />
                    <AnimatePresence>
                        {errors.mensaje && touched.mensaje && (
                            <motion.p 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-danger text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ml-2"
                            >
                                <FiAlertCircle /> {errors.mensaje}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Botón de Envío */}
                <button 
                    disabled={isSubmitting}
                    className="btn-primary flex items-center justify-center gap-3 group !rounded-2xl"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            ENVIAR REQUERIMIENTO
                        </>
                    )}
                </button>

                {/* Mensajes de Estado Final */}
                <AnimatePresence>
                    {submitStatus === 'success' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                        >
                            <FiCheckCircle className="text-green-500" />
                            <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">Ticket creado con éxito. Revisa tu correo.</p>
                        </motion.div>
                    )}
                    {submitStatus === 'error' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3"
                        >
                            <FiAlertCircle className="text-danger" />
                            <p className="text-xs font-bold text-danger uppercase tracking-tighter">Error al procesar el envío. Reintenta más tarde.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

export default SupportPage;
