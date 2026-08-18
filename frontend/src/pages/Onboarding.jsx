import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiShield } from 'react-icons/fi';
import api from '../services/api';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const validationSchema = Yup.object({
        edad: Yup.number().required('Requerido').min(13, 'Debes ser mayor a 13 años').max(100, 'Edad no válida'),
        peso: Yup.number().required('Requerido').min(30, 'Mínimo 30 kg').max(300, 'Peso excedido'),
        estatura: Yup.number().required('Requerido').min(100, 'Mínimo 100 cm').max(250, 'Estatura no válida'),
        genero: Yup.string().oneOf(['MASCULINO', 'FEMENINO', 'OTRO'], 'Selección inválida').required('Requerido'),
        nivel_actividad: Yup.string().oneOf(['SEDENTARIO', 'LIGERO', 'MODERADO', 'ACTIVO', 'MUY_ACTIVO'], 'Requerido').required('Requerido'),
        lfpdppp_agreed: Yup.boolean().oneOf([true], 'Debes aceptar los términos de privacidad (LFPDPPP)')
    });

    const formik = useFormik({
        initialValues: {
            edad: '',
            peso: '',
            estatura: '',
            genero: 'OTRO',
            nivel_actividad: 'MODERADO',
            lfpdppp_agreed: false
        },
        validationSchema,
        onSubmit: async (values) => {
            setSubmitting(true);
            setErrorMsg(null);
            try {
                // Ensure data is sent numerically where appropriate
                const payload = {
                    ...values,
                    edad: parseInt(values.edad, 10),
                    peso: parseFloat(values.peso),
                    estatura: parseInt(values.estatura, 10)
                };
                await api.post('/onboarding', payload);
                await refreshUser(); // Update needsOnboarding flag locally
                navigate('/dashboard'); // Ir al Dashboard ahora sí
            } catch (error) {
                console.error("Error al guardar métricas", error);
                setErrorMsg(error.response?.data?.message || 'Error al guardar los datos biométricos.');
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Animación global fluida tipo Dhero */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="w-full max-w-lg bg-surface border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary p-2 rounded-xl text-white dark:bg-white dark:text-black mb-4">
                        <Logo className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-textPrimary dark:text-white mb-2 text-center">Perfil Biométrico</h1>
                    <p className="text-textMuted text-center text-sm font-medium">
                        El motor necesita calibrarse. Tus datos construirán objetivos y predicciones matemáticas personalizadas.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Edad y Estatura */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Edad</label>
                            <input 
                                name="edad" type="number" 
                                value={formik.values.edad} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`input-field mt-1 ${formik.touched.edad && formik.errors.edad ? 'border-danger' : ''}`}
                                placeholder="Ej: 28"
                            />
                            {formik.touched.edad && formik.errors.edad && <span className="text-danger text-xs mt-1 block">{formik.errors.edad}</span>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Estatura (cm)</label>
                            <input 
                                name="estatura" type="number" 
                                value={formik.values.estatura} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`input-field mt-1 ${formik.touched.estatura && formik.errors.estatura ? 'border-danger' : ''}`}
                                placeholder="Ej: 175"
                            />
                            {formik.touched.estatura && formik.errors.estatura && <span className="text-danger text-xs mt-1 block">{formik.errors.estatura}</span>}
                        </div>
                    </div>

                    {/* Peso */}
                    <div>
                        <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Peso Físico (kg)</label>
                        <input 
                            name="peso" type="number" step="0.1"
                            value={formik.values.peso} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            className={`input-field mt-1 ${formik.touched.peso && formik.errors.peso ? 'border-danger' : ''}`}
                            placeholder="Ej: 72.5"
                        />
                        {formik.touched.peso && formik.errors.peso && <span className="text-danger text-xs mt-1 block">{formik.errors.peso}</span>}
                    </div>

                    {/* Género y Nivel de Actividad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Biotipo Base</label>
                            <select 
                                name="genero" value={formik.values.genero} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className="input-field mt-1 appearance-none"
                            >
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Actividad Diaria</label>
                            <select 
                                name="nivel_actividad" value={formik.values.nivel_actividad} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className="input-field mt-1 appearance-none text-xs"
                            >
                                <option value="SEDENTARIO">Sedentario (Oficina)</option>
                                <option value="LIGERO">Ligero (1-2 act/sem)</option>
                                <option value="MODERADO">Moderado (3-5 act/sem)</option>
                                <option value="ACTIVO">Activo (Deportista)</option>
                                <option value="MUY_ACTIVO">Muy Activo (Atleta/Físico)</option>
                            </select>
                        </div>
                    </div>

                    {/* Privacidad LFPDPPP */}
                    <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl mt-8">
                        <div className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                                <input 
                                    type="checkbox" name="lfpdppp_agreed" id="lfpdppp"
                                    checked={formik.values.lfpdppp_agreed} onChange={formik.handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-black dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label htmlFor="lfpdppp" className="text-sm font-medium text-textPrimary dark:text-gray-200 flex flex-col cursor-pointer">
                                    <span className="flex items-center gap-1.5 mb-1"><FiShield className="text-accent" /> Aviso de Privacidad Simplificado</span>
                                    <span className="text-xs text-textMuted leading-relaxed">
                                        De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México, confirmas que estos datos sensibles serán cifrados y usados exclusivamente por la Autoridad Algorítmica de Quantify para predicción biométrica de desarrollo personal.
                                    </span>
                                </label>
                            </div>
                        </div>
                        {formik.touched.lfpdppp_agreed && formik.errors.lfpdppp_agreed && (
                            <p className="text-danger text-xs font-bold mt-2 ml-8">{formik.errors.lfpdppp_agreed}</p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className={`btn-primary flex items-center justify-center gap-2 mt-4 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Procesando Biométrica...' : 'Inicializar Motor Quantify'} <FiArrowRight />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
