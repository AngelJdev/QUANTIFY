import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiActivity, FiShield, FiKey, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const steps = [
    { id: 'privacy', title: 'Legalidad LFPDPPP', icon: FiShield },
    { id: 'credentials', title: 'Identidad Digital', icon: FiUser },
    { id: 'metrics', title: 'Perímetro Biométrico', icon: FiActivity }
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const validationSchema = Yup.object().shape({
        // Step 0: Privacy
        lfpdppp_agreed: Yup.boolean().when([], {
            is: () => currentStep === 0,
            then: (sch) => sch.oneOf([true], 'Debes aceptar los términos para continuar.')
        }),
        // Step 1: Account & Security
        nombre: Yup.string().when([], {
            is: () => currentStep === 1,
            then: (sch) => sch.min(3, 'Mínimo 3 caracteres').required('Requerido')
        }),
        email: Yup.string().when([], {
            is: () => currentStep === 1,
            then: (sch) => sch.email('Email inválido').required('Requerido')
        }),
        password: Yup.string().when([], {
            is: () => currentStep === 1,
            then: (sch) => sch.min(6, 'Mínimo 6 caracteres').required('Requerido')
        }),
        confirmPassword: Yup.string().when([], {
            is: () => currentStep === 1,
            then: (sch) => sch.oneOf([Yup.ref('password'), null], 'No coinciden').required('Requerido')
        }),
        securityPhrase: Yup.string().when([], {
            is: () => currentStep === 1,
            then: (sch) => sch.min(10, 'Frase demasiado corta (mín 10 carc)').required('Requerido')
        }),
        // Step 2: Metrics
        edad: Yup.number().when([], {
            is: () => currentStep === 2,
            then: (sch) => sch.min(13).max(100).required('Requerido')
        }),
        peso: Yup.number().when([], {
            is: () => currentStep === 2,
            then: (sch) => sch.min(30).max(300).required('Requerido')
        }),
        estatura: Yup.number().when([], {
            is: () => currentStep === 2,
            then: (sch) => sch.min(100).max(250).required('Requerido')
        })
    });

    const formik = useFormik({
        initialValues: {
            lfpdppp_agreed: false,
            nombre: '',
            email: '',
            password: '',
            confirmPassword: '',
            securityPhrase: '',
            edad: '',
            peso: '',
            estatura: '',
            genero: 'OTRO',
            nivel_actividad: 'MODERADO'
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    nombre: values.nombre,
                    email: values.email,
                    password: values.password,
                    securityPhrase: values.securityPhrase,
                    metrics: {
                        edad: parseInt(values.edad),
                        peso: parseFloat(values.peso),
                        estatura: parseInt(values.estatura),
                        genero: values.genero,
                        nivel_actividad: values.nivel_actividad
                    }
                };
                await register(payload);
                navigate('/dashboard');
            } catch (error) {
                setErrorMsg(error.response?.data?.message || 'Error al procesar la vinculación.');
            } finally {
                setSubmitting(false);
            }
        }
    });

    const nextStep = async () => {
        const fields = currentStep === 0
            ? ['lfpdppp_agreed']
            : currentStep === 1
                ? ['nombre', 'email', 'password', 'confirmPassword', 'securityPhrase']
                : ['edad', 'peso', 'estatura'];

        const errors = await formik.validateForm();
        const stepErrors = fields.filter(f => !!errors[f]);

        if (stepErrors.length === 0) {
            if (currentStep < 2) setCurrentStep(prev => prev + 1);
            else formik.handleSubmit();
        } else {
            fields.forEach(f => formik.setFieldTouched(f, true));
        }
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="absolute top-8 right-8">
                <ThemeToggle className="bg-surface shadow-xl border border-gray-200 dark:border-white/10" />
            </div>

            <div className="w-full max-w-xl">
                <header className="text-center mb-10">
                    <div className="inline-flex bg-surface dark:bg-white/5 p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl mb-6">
                        <Logo className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-textPrimary dark:text-white tracking-tight leading-none mb-2">Quantify Intelligence</h1>
                    <p className="text-textMuted uppercase text-[10px] font-black tracking-[0.2em]">Capa de Abstracción de Datos v2.0</p>
                </header>

                <div className="bg-surface border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden transition-all duration-500">
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-10">
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary dark:bg-white' : 'bg-gray-100 dark:bg-white/5'}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        >
                            {/* STEP 0: PRIVACY */}
                            {currentStep === 0 && (
                                <div className="space-y-8 py-4">
                                    <div className="flex gap-4 p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                                        <FiShield className="text-3xl text-primary shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-textPrimary dark:text-white mb-2 uppercase tracking-wide text-sm">Protección de Datos (LFPDPPP)</h3>
                                            <p className="text-xs text-textMuted leading-relaxed">
                                                Para iniciar el protocolo, necesitamos su consentimiento. Sus datos serán cifrados y procesados bajo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).
                                            </p>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-4 cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-textMuted/10">
                                        <input
                                            type="checkbox"
                                            {...formik.getFieldProps('lfpdppp_agreed')}
                                            className="w-6 h-6 rounded-lg text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-black"
                                        />
                                        <span className="text-sm font-bold text-textPrimary dark:text-white">He leído y acepto el Aviso de Privacidad Simplificado.</span>
                                    </label>
                                    {formik.touched.lfpdppp_agreed && formik.errors.lfpdppp_agreed && <p className="text-danger text-[10px] font-black uppercase pl-2">{formik.errors.lfpdppp_agreed}</p>}
                                </div>
                            )}

                            {/* STEP 1: ACCOUNT & SECURITY */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-textPrimary dark:text-white mb-6 uppercase tracking-tight">Identificación y Cifrado</h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="label-style">Nombre de Enlace</label>
                                                <div className="relative">
                                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                                    <input {...formik.getFieldProps('nombre')} className="input-field pl-12" placeholder="Usuario" />
                                                </div>
                                                {formik.touched.nombre && formik.errors.nombre && <p className="error-text">{formik.errors.nombre}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="label-style">Email de Registro</label>
                                                <div className="relative">
                                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                                    <input {...formik.getFieldProps('email')} className="input-field pl-12" type="email" placeholder="usuario@quantify.ai" />
                                                </div>
                                                {formik.touched.email && formik.errors.email && <p className="error-text">{formik.errors.email}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="label-style">Contraseña</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                                    <input {...formik.getFieldProps('password')} className="input-field pl-12" type="password" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="label-style">Confirmar Contraseña</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                                    <input {...formik.getFieldProps('confirmPassword')} className="input-field pl-12" type="password" placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-style">Frase Secreta de Recuperación</label>
                                            <div className="relative">
                                                <FiKey className="absolute left-4 top-4 text-textMuted" />
                                                <textarea
                                                    {...formik.getFieldProps('securityPhrase')}
                                                    className="input-field pl-12 pt-3 min-h-[80px] resize-none"
                                                    placeholder="Ej: mi_primera_logro_es_ser_constante"
                                                />
                                            </div>
                                            <p className="text-[9px] text-textMuted italic mt-1 uppercase font-bold">Esta frase es el único método de restauración de su cuenta.</p>
                                            {formik.touched.securityPhrase && formik.errors.securityPhrase && <p className="error-text">{formik.errors.securityPhrase}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: METRICS */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-textPrimary dark:text-white uppercase tracking-tight">Variables Antropométricas</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="label-style">Edad</label>
                                            <input {...formik.getFieldProps('edad')} className="input-field" type="number" placeholder="25" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-style">Peso (kg)</label>
                                            <input {...formik.getFieldProps('peso')} className="input-field" type="number" step="0.1" placeholder="70" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-style">Estatura (cm)</label>
                                            <input {...formik.getFieldProps('estatura')} className="input-field" type="number" placeholder="175" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="label-style">Género</label>
                                            <select {...formik.getFieldProps('genero')} className="input-field">
                                                <option value="MASCULINO">Masculino</option>
                                                <option value="FEMENINO">Femenino</option>
                                                <option value="OTRO">Otro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-style">Nivel Actividad</label>
                                            <select {...formik.getFieldProps('nivel_actividad')} className="input-field">
                                                <option value="SEDENTARIO">Sedentario</option>
                                                <option value="MODERADO">Moderado</option>
                                                <option value="ACTIVO">Activo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {errorMsg && (
                        <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-[10px] font-black uppercase text-center tracking-widest">
                            ERROR SISTEMA: {errorMsg}
                        </div>
                    )}

                    <footer className="mt-12 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-textMuted hover:text-textPrimary dark:hover:text-white transition-opacity ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <FiArrowLeft /> Retornar
                        </button>
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={formik.isSubmitting}
                            className="bg-primary dark:bg-white text-surface dark:text-black px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-primary/20 dark:shadow-white/5 hover:scale-105 transition-all"
                        >
                            {formik.isSubmitting ? 'Procesando Enlace...' : currentStep === 2 ? 'Sellado de Datos' : 'Siguiente'}
                            {currentStep < 2 && <FiArrowRight />}
                        </button>
                    </footer>
                </div>

                <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-textMuted leading-loose">
                    ¿Cuenta existente? <Link to="/login" className="text-primary dark:text-white hover:underline">Acceso Directo</Link>
                </p>
            </div>

            <style jsx>{`
                .label-style {
                    @apply text-[10px] font-black text-textMuted uppercase tracking-[0.2em] block mb-2 px-1;
                }
                .error-text {
                    @apply text-[9px] font-bold text-danger mt-1 uppercase pl-1;
                }
            `}</style>
        </div>
    );
}
