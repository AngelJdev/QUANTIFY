import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';

const stepVariants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
    exit:    { x: -40, opacity: 0, transition: { duration: 0.2 } }
};

const STEPS = ['Correo', 'Código OTP', 'Nueva Clave', 'Listo'];

function ErrorBox({ message }) {
    return (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-xl mb-4 text-xs flex items-start gap-2 font-medium">
            <FiAlertCircle className="shrink-0 mt-0.5" size={13} />
            <p>{message}</p>
        </div>
    );
}

// 6-box OTP input
function OTPInput({ value, onChange }) {
    const inputs = useRef([]);
    const digits = value.padEnd(6, ' ').split('');

    const handleKey = (e, i) => {
        if (e.key === 'Backspace') {
            const next = [...digits];
            next[i] = ' ';
            onChange(next.join('').trimEnd());
            if (i > 0) inputs.current[i - 1]?.focus();
        } else if (/^\d$/.test(e.key)) {
            const next = [...digits];
            next[i] = e.key;
            onChange(next.join('').trimEnd());
            if (i < 5) inputs.current[i + 1]?.focus();
        }
        e.preventDefault();
    };

    return (
        <div className="flex gap-3 justify-center my-4">
            {[0,1,2,3,4,5].map(i => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] === ' ' ? '' : digits[i]}
                    onKeyDown={e => handleKey(e, i)}
                    onChange={() => {}} // controlled via onKeyDown
                    onFocus={() => inputs.current[i]?.select()}
                    className="w-12 h-14 text-center text-2xl font-black rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#111111] text-textPrimary dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            ))}
        </div>
    );
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 0 — Send OTP via email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar el código.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — Verify OTP + set new password
    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.trim().length !== 6) {
            setError('El código debe tener 6 dígitos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp: otp.trim(), newPassword });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-background fade-in">
            {/* Left Side — Brand */}
            <div className="hidden lg:flex w-[45%] flex-col justify-between p-10 relative bg-primary dark:bg-background overflow-hidden border-r dark:border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] dark:shadow-none z-10">
                <div className="hidden md:block absolute top-[-20%] left-[10%] w-[800px] h-[300px] bg-white/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-cyan-900/50 to-transparent" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-surface p-2.5 rounded-2xl shadow-lg border border-gray-200 dark:border-white/5">
                        <Logo className="w-8 h-8" />
                    </div>
                </div>
                <div className="relative z-10 max-w-lg mt-[-10vh]">
                    <div className="inline-block border border-white/20 dark:border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm bg-white/5">
                        <span className="text-[10px] font-bold text-white dark:text-gray-300 uppercase tracking-widest">Recuperación de Cuenta</span>
                    </div>
                    <h2 className="text-5xl leading-[1.05] tracking-tight text-white mb-4">
                        <span className="font-thin">Tu identidad,</span><br />
                        <span className="font-extrabold">protegida.</span>
                    </h2>
                    <p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed max-w-md font-light">
                        Verificamos tu identidad enviando un código de 6 dígitos a tu correo. Sin contraseñas temporales, sin fricciones.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-gray-400 dark:text-gray-600 flex gap-6 font-medium">
                    <span>© {new Date().getFullYear()} QUANTIFY MVP</span>
                    <Link to="/privacy" className="transition hover:text-white hover:underline">Privacidad</Link>
                </div>
            </div>

            {/* Right Side — Form */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center relative z-20 bg-background">
                <div className="hidden md:block absolute top-[-10%] right-[10%] w-[600px] h-[300px] bg-cyan-400/5 dark:bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute top-4 right-6 lg:top-6 lg:right-10 flex justify-end w-full z-50">
                    <ThemeToggle className="bg-surface shadow-sm border border-gray-200 dark:border-white/5" />
                </div>

                <div className="w-full max-w-[360px] relative z-10">
                    {/* Step Progress */}
                    <div className="flex items-center gap-1.5 mb-8">
                        {STEPS.map((label, i) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${
                                    i < step ? 'bg-primary border-primary text-white' :
                                    i === step ? 'bg-primary/10 border-primary text-primary' :
                                    'bg-surface border-gray-200 dark:border-white/10 text-textMuted'
                                }`}>
                                    {i < step ? <FiCheckCircle size={12} /> : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest hidden sm:block ${i === step ? 'text-textPrimary' : 'text-textMuted'}`}>{label}</span>
                                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 dark:bg-white/10 mx-0.5" />}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ── STEP 0: Email ── */}
                        {step === 0 && (
                            <motion.div key="s0" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                                <div className="mb-6">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary mb-1.5">Recuperar Cuenta</h2>
                                    <p className="text-textMuted text-xs font-medium">Ingresa tu correo y te enviaremos un código de 6 dígitos.</p>
                                </div>
                                {error && <ErrorBox message={error} />}
                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Correo electrónico</label>
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                            placeholder="usuario@quantify.test" />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary mt-4 flex items-center justify-center gap-2 group text-sm py-3">
                                        {loading ? 'Enviando código...' : 'Enviar Código OTP'}
                                        {!loading && <FiMail className="group-hover:scale-110 transition-transform" size={15} />}
                                    </button>
                                </form>
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
                                    <Link to="/login" className="text-xs text-textMuted hover:text-textPrimary transition-colors flex items-center justify-center gap-1 font-medium">
                                        <FiArrowLeft size={12} /> Volver al inicio de sesión
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 1: Enter OTP ── */}
                        {step === 1 && (
                            <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                                <div className="mb-4">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary mb-1.5">Ingresa el Código</h2>
                                    <p className="text-textMuted text-xs font-medium">
                                        Enviamos un código a <strong className="text-textPrimary">{email}</strong>.<br />Revisa tu bandeja de entrada o spam.
                                    </p>
                                </div>
                                {error && <ErrorBox message={error} />}
                                <OTPInput value={otp} onChange={setOtp} />
                                <button
                                    onClick={() => { if (otp.trim().length === 6) setStep(2); else setError('Ingresa los 6 dígitos del código.'); }}
                                    className="btn-primary w-full flex items-center justify-center gap-2 group text-sm py-3 mt-2">
                                    Verificar Código
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </button>
                                <div className="mt-4 text-center space-y-2">
                                    <button onClick={() => handleSendOTP({ preventDefault: () => {} })}
                                        className="text-xs text-primary hover:underline font-bold block mx-auto">
                                        Reenviar código
                                    </button>
                                    <button onClick={() => { setStep(0); setError(''); setOtp(''); }}
                                        className="text-xs text-textMuted hover:text-textPrimary transition-colors flex items-center justify-center gap-1 mx-auto font-medium">
                                        <FiArrowLeft size={12} /> Cambiar correo
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: New Password ── */}
                        {step === 2 && (
                            <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                                <div className="mb-6">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary mb-1.5">Nueva Contraseña</h2>
                                    <p className="text-textMuted text-xs font-medium">Elige una contraseña segura para tu cuenta.</p>
                                </div>
                                {error && <ErrorBox message={error} />}
                                <form onSubmit={handleReset} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Nueva Contraseña</label>
                                        <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                            placeholder="Mínimo 6 caracteres" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-textPrimary uppercase tracking-wider">Confirmar Contraseña</label>
                                        <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            className="input-field py-2.5 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                            placeholder="Repite la nueva contraseña" />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary mt-4 flex items-center justify-center gap-2 group text-sm py-3">
                                        {loading ? 'Guardando...' : 'Restablecer Contraseña'}
                                        {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Done ── */}
                        {step === 3 && (
                            <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-6">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
                                    className="w-20 h-20 bg-success/10 border-2 border-success/30 rounded-full flex items-center justify-center mx-auto">
                                    <FiCheckCircle className="text-success" size={36} />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-textPrimary mb-2">¡Contraseña Restablecida!</h2>
                                    <p className="text-textMuted text-sm font-medium max-w-[260px] mx-auto">
                                        Tu acceso ha sido restaurado. Inicia sesión con tu nueva contraseña.
                                    </p>
                                </div>
                                <button onClick={() => navigate('/login')}
                                    className="btn-primary flex items-center justify-center gap-2 group text-sm py-3 mx-auto">
                                    Ir al Login <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
