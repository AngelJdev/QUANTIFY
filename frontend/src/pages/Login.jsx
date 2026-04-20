import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [authError, setAuthError] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
            password: Yup.string().required('La contraseña es obligatoria'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setAuthError('');
                await login(values);
                navigate('/dashboard');
            } catch (error) {
                setAuthError(error.response?.data?.message || 'Error al iniciar sesión');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="h-screen w-full flex overflow-hidden bg-background fade-in">
            {/* Left Side - Brand Showcase (Dhero Aesthetic) */}
            <div className="hidden lg:flex w-[45%] flex-col justify-between p-10 relative bg-primary dark:bg-background overflow-hidden border-r dark:border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] dark:shadow-none z-10">
                {/* Dhero-style Volumetric Glows */}
                <div className="absolute top-[-20%] left-[10%] w-[800px] h-[300px] bg-white/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-cyan-900/50 to-transparent"></div>

                {/* Brand Logo Area */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-surface p-2.5 rounded-2xl shadow-lg border border-gray-200 dark:border-white/5">
                        <Logo className="w-8 h-8" />
                    </div>
                </div>

                {/* Motivational Quote Area (Studio Typography) */}
                <div className="relative z-10 max-w-lg mt-[-10vh]">
                    <div className="inline-block border border-white/20 dark:border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm bg-white/5">
                        <span className="text-[10px] font-bold text-white dark:text-gray-300 uppercase tracking-widest">INGENIERÍA PERSONAL</span>
                    </div>
                    <h2 className="text-5xl leading-[1.05] tracking-tight text-white mb-4">
                        <span className="font-thin">Turning data</span><br />
                        <span className="font-extrabold">into success</span>
                    </h2>
                    <p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed max-w-md font-light">
                        El progreso exponencial no es suerte, es recolección pura. Mide tu adherencia, visualiza tu evolución y diseña tu futuro.
                    </p>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 text-xs text-gray-400 dark:text-gray-600 flex gap-6 font-medium">
                    <span>© {new Date().getFullYear()} QUANTIFY MVP</span>
                    <Link to="/sitemap" className="transition hover:text-white hover:underline">Sitemap</Link>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center relative z-20 bg-background">
                {/* Dhero Glow on Right Side */}
                <div className="absolute top-[-10%] right-[10%] w-[600px] h-[300px] bg-cyan-400/5 dark:bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="absolute top-4 right-6 lg:top-6 lg:right-10 flex justify-end w-full z-50">
                    <ThemeToggle className="bg-surface shadow-sm border border-gray-200 dark:border-white/5" />
                </div>

                <div className="w-full max-w-[340px] relative z-10">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-6 justify-center">
                        <div className="bg-surface p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5">
                            <Logo className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-textPrimary">Quantify.</h1>
                    </div>

                    <div className="mb-6 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary mb-1.5">Iniciar Sesión</h2>
                        <p className="text-textMuted text-xs font-medium">Accede al panel de control de tu vida.</p>
                    </div>

                    {authError && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-xl mb-4 text-xs flex items-start gap-2 backdrop-blur-sm font-medium">
                            <span className="text-sm mt-0.5">⚠️</span>
                            <p>{authError}</p>
                        </div>
                    )}

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Correo</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                placeholder="usuario@quantify.test"
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.email}</div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Contraseña</label>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                placeholder="••••••••"
                                {...formik.getFieldProps('password')}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.password}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="btn-primary mt-6 flex items-center justify-center gap-2 group text-sm py-3"
                        >
                            {formik.isSubmitting ? 'Verificando...' : 'Entrar al Ecosistema'}
                            {!formik.isSubmitting && <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
                        <p className="text-xs text-textMuted font-medium">
                            ¿Aún no mides tu vida?{' '}
                            <Link to="/register" className="text-primary dark:text-white font-extrabold hover:underline transition-colors">
                                Iniciar gratis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
