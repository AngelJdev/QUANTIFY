import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');

    const formik = useFormik({
        initialValues: {
            nombre: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            nombre: Yup.string().min(3, 'El nombre debe tener al menos 3 caracteres').required('Requerido'),
            email: Yup.string().email('Correo inválido').required('Requerido'),
            password: Yup.string().min(6, 'Debe tener al menos 6 caracteres').required('Requerido'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
                .required('Requerido'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Removemos confirmPassword antes de enviarlo a la API
                const userData = { nombre: values.nombre, email: values.email, password: values.password };
                setErrorMsg('');
                await register(userData);
                navigate('/dashboard');
            } catch (error) {
                setErrorMsg(error.response?.data?.message || 'Error al registrar.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-background fade-in">
            {/* Absolute Theme Toggle */}
            <div className="absolute top-4 right-6 lg:top-6 lg:right-10 flex justify-end w-full z-50">
                <ThemeToggle className="bg-surface shadow-sm border border-gray-200 dark:border-white/5" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-20">
                {/* Dhero-style Volumetric Glows */}
                <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-cyan-400/5 dark:bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="w-full max-w-[340px] relative z-10 bg-surface dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-3xl shadow-2xl dark:shadow-none border border-gray-200 dark:border-white/10">
                    
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="bg-white dark:bg-[#111111] p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5">
                            <Logo className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-textPrimary mt-2">
                            Crear Cuenta
                        </h2>
                    </div>
                    
                    {errorMsg && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-xl mb-4 text-xs font-medium text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                {...formik.getFieldProps('nombre')}
                            />
                             {formik.touched.nombre && formik.errors.nombre ? (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.nombre}</div>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                {...formik.getFieldProps('email')}
                            />
                             {formik.touched.email && formik.errors.email ? (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.email}</div>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                {...formik.getFieldProps('password')}
                            />
                            {formik.touched.password && formik.errors.password ? (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.password}</div>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Confirmar</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                {...formik.getFieldProps('confirmPassword')}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                                <div className="text-danger text-[10px] font-semibold pl-1">{formik.errors.confirmPassword}</div>
                            ) : null}
                        </div>

                        <button type="submit" disabled={formik.isSubmitting} className="btn-primary mt-6 text-sm py-3">
                            {formik.isSubmitting ? 'Creando...' : 'Comenzar Ahora'}
                        </button>
                    </form>


                    <p className="text-center text-xs text-textMuted mt-6 font-medium">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-primary dark:text-white font-extrabold hover:underline">Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
