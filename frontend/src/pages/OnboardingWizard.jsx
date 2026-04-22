import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiShield, FiUser, FiActivity, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';

const steps = [
    { id: 'privacy', title: 'Privacidad LFPDPPP', icon: FiShield },
    { id: 'biometrics', title: 'Datos Biométricos', icon: FiUser },
    { id: 'success', title: 'Cibermetría Lista', icon: FiCheckCircle }
];

export default function OnboardingWizard() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const validationSchema = Yup.object({
        lfpdppp_agreed: Yup.boolean().oneOf([true], 'Debes aceptar los términos legales para continuar.'),
        edad: Yup.number().required('Requerido').min(13, 'Mínimo 13 años').max(100, 'Rango no válido'),
        peso: Yup.number().required('Requerido').min(30, 'Mínimo 30kg').max(300, 'Rango excedido'),
        estatura: Yup.number().required('Requerido').min(100, 'cm Mínimo').max(250, 'Rango no válido'),
        genero: Yup.string().oneOf(['MASCULINO', 'FEMENINO', 'OTRO'], 'Selecciona uno').required('Requerido'),
        nivel_actividad: Yup.string().oneOf(['SEDENTARIO', 'LIGERO', 'MODERADO', 'ACTIVO', 'MUY_ACTIVO'], 'Requerido').required('Requerido')
    });

    const formik = useFormik({
        initialValues: {
            lfpdppp_agreed: false,
            edad: '',
            peso: '',
            estatura: '',
            genero: 'OTRO',
            nivel_actividad: 'MODERADO'
        },
        validationSchema,
        onSubmit: async (values) => {
            setSubmitting(true);
            try {
                await api.post('/onboarding', {
                    ...values,
                    edad: parseInt(values.edad, 10),
                    peso: parseFloat(values.peso),
                    estatura: parseInt(values.estatura, 10)
                });
                await refreshUser();
                setCurrentStep(2); // Ir al paso de éxito
            } catch (error) {
                setErrorMsg(error.response?.data?.message || 'Error al sincronizar datos biométricos.');
                setSubmitting(false);
            }
        }
    });

    const nextStep = async () => {
        const fieldsToValidate = currentStep === 0 
            ? ['lfpdppp_agreed']
            : ['edad', 'peso', 'estatura', 'genero', 'nivel_actividad'];
        
        const errors = await formik.validateForm();
        const hasErrors = fieldsToValidate.some(f => !!errors[f]);
        
        if (!hasErrors) {
            if (currentStep === 1) {
                formik.handleSubmit();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            // Marcar campos como tocados para mostrar errores
            fieldsToValidate.forEach(f => formik.setFieldTouched(f, true));
        }
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 transition-colors duration-500">
            <div className="w-full max-w-2xl">
                <Breadcrumbs />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-14 relative overflow-hidden"
                >
                    {/* Header del Wizard */}
                    <header className="mb-12 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 dark:bg-white/5 p-2 rounded-lg">
                                    <Logo className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Protocolo de Inicio</span>
                            </div>
                            <h1 className="text-3xl font-black text-textPrimary dark:text-white leading-none">
                                {steps[currentStep].title}
                            </h1>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-primary/20 dark:text-white/10">0{currentStep + 1}</span>
                        </div>
                    </header>

                    {/* Barra de Progreso */}
                    <div className="flex gap-2 mb-10">
                        {steps.map((s, i) => (
                            <div 
                                key={s.id}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-accent' : 'bg-gray-100 dark:bg-white/5'}`}
                            />
                        ))}
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs font-bold">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={e => e.preventDefault()}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                            >
                                {currentStep === 0 && (
                                    <div className="space-y-8 py-4">
                                        <div className="flex gap-4 p-6 bg-accent/5 border border-accent/20 rounded-3xl">
                                            <FiShield className="text-3xl text-accent shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-textPrimary dark:text-white mb-2">Protección de Datos LFPDPPP</h3>
                                                <p className="text-xs text-textMuted leading-relaxed">
                                                    Sus datos biométricos serán tratados bajo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México). Solo se utilizarán para la personalización de algoritmos de bienestar.
                                                </p>
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-4 cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={formik.values.lfpdppp_agreed}
                                                onChange={e => formik.setFieldValue('lfpdppp_agreed', e.target.checked)}
                                                className="w-6 h-6 rounded-lg text-accent dark:bg-black border-gray-300 dark:border-white/20 focus:ring-accent" 
                                            />
                                            <span className="text-sm font-medium text-textPrimary dark:text-white">He leído y acepto el Aviso de Privacidad Simplificado.</span>
                                        </label>
                                        {formik.touched.lfpdppp_agreed && formik.errors.lfpdppp_agreed && (
                                            <p className="text-danger text-xs font-bold mt-2 ml-4">{formik.errors.lfpdppp_agreed}</p>
                                        )}
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1 shadow-sm block">Edad</label>
                                                <input 
                                                    {...formik.getFieldProps('edad')}
                                                    className={`input-field ${formik.touched.edad && formik.errors.edad ? 'border-danger' : ''}`}
                                                    placeholder="25" type="number"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1 block">Estatura (cm)</label>
                                                <input 
                                                    {...formik.getFieldProps('estatura')}
                                                    className={`input-field ${formik.touched.estatura && formik.errors.estatura ? 'border-danger' : ''}`}
                                                    placeholder="175" type="number"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1 block">Peso Corporal (kg)</label>
                                            <input 
                                                {...formik.getFieldProps('peso')}
                                                className={`input-field ${formik.touched.peso && formik.errors.peso ? 'border-danger' : ''}`}
                                                placeholder="70.5" type="number" step="0.1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1 block">Género</label>
                                                <select {...formik.getFieldProps('genero')} className="input-field">
                                                    <option value="MASCULINO">Masculino</option>
                                                    <option value="FEMENINO">Femenino</option>
                                                    <option value="OTRO">Otro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1 block">Actividad</label>
                                                <select {...formik.getFieldProps('nivel_actividad')} className="input-field">
                                                    <option value="SEDENTARIO">Sedentario</option>
                                                    <option value="LIGERO">Ligero</option>
                                                    <option value="MODERADO">Moderado</option>
                                                    <option value="ACTIVO">Activo</option>
                                                    <option value="MUY_ACTIVO">Atleta</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="text-center py-10">
                                        <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-8">
                                            <FiCheckCircle size={48} className="animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-black text-textPrimary dark:text-white mb-4">¡Cibermetría Calibrada!</h2>
                                        <p className="text-textMuted max-w-sm mx-auto mb-10 font-medium">
                                            Tus métricas han sido registradas. El motor de Quantify ahora generará metas personalizadas basadas en tu biotipo.
                                        </p>
                                        <button 
                                            onClick={() => navigate('/dashboard')}
                                            className="btn-primary"
                                        >
                                            Entrar al Dashboard
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {currentStep < 2 && (
                            <footer className="mt-12 flex justify-between items-center">
                                <button 
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest text-textMuted hover:text-textPrimary dark:hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                                >
                                    <FiArrowLeft /> Atrás
                                </button>
                                <button 
                                    type="button"
                                    onClick={nextStep}
                                    disabled={submitting}
                                    className="bg-primary dark:bg-white text-surface dark:text-black font-black px-10 py-5 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 dark:shadow-white/5"
                                >
                                    {submitting ? 'Sincronizando...' : currentStep === 1 ? 'Finalizar' : 'Continuar'} <FiArrowRight />
                                </button>
                            </footer>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
