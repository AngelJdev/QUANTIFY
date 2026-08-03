import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { GoogleLogin } from '@react-oauth/google';

// ─── Starfield Canvas Component ───────────────────────────────────────────────
function StarfieldCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const resize = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Mouse parallax tracking (smoothed)
        let mouse = { x: 0.5, y: 0.5 };    // normalized 0-1
        let smooth = { x: 0.5, y: 0.5 };   // interpolated

        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) / rect.width;
            mouse.y = (e.clientY - rect.top)  / rect.height;
        };
        canvas.parentElement?.addEventListener('mousemove', onMouseMove);

        // Generate stars with a depth (parallax) layer 0–1
        const STAR_COUNT = 180;
        const stars = Array.from({ length: STAR_COUNT }, () => {
            const depth = Math.random(); // 0 = far/slow, 1 = close/fast
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: depth * 1.1 + 0.15,
                speed: depth * 0.08 + 0.015,
                baseOpacity: depth * 0.45 + 0.08,
                depth,
                twinkleSpeed:  Math.random() * 0.007 + 0.002,
                twinkleOffset: Math.random() * Math.PI * 2,
            };
        });

        let t = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t++;

            // Smoothly lerp toward actual mouse position
            smooth.x += (mouse.x - smooth.x) * 0.04;
            smooth.y += (mouse.y - smooth.y) * 0.04;

            const offsetX = (smooth.x - 0.5) * 2; // -1 to +1
            const offsetY = (smooth.y - 0.5) * 2;

            stars.forEach(star => {
                // Drift upward
                star.y -= star.speed;
                if (star.y < -4) {
                    star.y = canvas.height + 4;
                    star.x = Math.random() * canvas.width;
                }

                // Parallax displacement (farther stars barely move)
                const px = star.x + offsetX * star.depth * 18;
                const py = star.y + offsetY * star.depth * 12;

                // Twinkle
                const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
                const alpha = star.baseOpacity * (0.55 + 0.45 * twinkle);

                // Glow for closer/bigger stars
                if (star.r > 0.8) {
                    const g = ctx.createRadialGradient(px, py, 0, px, py, star.r * 4);
                    g.addColorStop(0, `rgba(160,190,255,${alpha * 0.6})`);
                    g.addColorStop(1, `rgba(160,190,255,0)`);
                    ctx.beginPath();
                    ctx.arc(px, py, star.r * 4, 0, Math.PI * 2);
                    ctx.fillStyle = g;
                    ctx.fill();
                }

                // Core dot
                ctx.beginPath();
                ctx.arc(px, py, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(210,225,255,${alpha})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            canvas.parentElement?.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.7 }}
        />
    );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
const Login = () => {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [authError, setAuthError] = useState('');

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setAuthError('');
            const userData = await loginWithGoogle(credentialResponse.credential, 'login');
            const userRole = userData?.rol;
            navigate(userRole === 0 || userRole === 2 ? '/admin-panel' : '/dashboard');
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                // Not found -> redirect to register
                navigate('/register');
            } else {
                setAuthError(error.response?.data?.message || 'Error al iniciar sesión con Google');
            }
        }
    };

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email:    Yup.string().email('Correo inválido').required('El correo es obligatorio'),
            password: Yup.string().required('La contraseña es obligatoria'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setAuthError('');
                const userData = await login(values);
                // Redirect based on role: 0=ADMIN, 2=MOD → admin panel, 1=USER → dashboard
                const userRole = userData?.rol;
                navigate(userRole === 0 || userRole === 2 ? '/admin-panel' : '/dashboard');
            } catch (error) {
                setAuthError(error.response?.data?.message || 'Error al iniciar sesión');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="h-screen w-full flex overflow-hidden bg-background fade-in">

            {/* ── LEFT: Brand Showcase ── */}
            <div className="hidden lg:flex w-[48%] flex-col justify-between p-12 relative overflow-hidden z-10"
                style={{ background: 'linear-gradient(160deg, #010306 0%, #030a1e 50%, #020510 100%)' }}>

                {/* Starfield */}
                <StarfieldCanvas />

                {/* Ambient blobs */}
                <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[400px] bg-blue-800/10 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[-15%] w-[400px] h-[400px] bg-indigo-700/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white font-black text-xl tracking-tighter">QUANTIFY</span>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 border border-blue-400/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm bg-blue-500/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Software de Ingeniería Personal</span>
                    </div>

                    <h2 className="font-black text-white leading-[1.0] tracking-tight mb-6"
                        style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)' }}>
                        <span style={{ fontWeight: 200, display: 'block' }}>Turning data</span>
                        <span style={{ display: 'block' }}>into</span>
                        <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300 bg-clip-text"
                            style={{ WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', display: 'block' }}>
                            success.
                        </span>
                    </h2>

                    <p className="text-blue-100/50 text-base leading-relaxed max-w-sm font-light">
                        El progreso exponencial no es suerte, es recolección pura. Mide tu adherencia, visualiza tu evolución y diseña tu futuro.
                    </p>

                    {/* Stats row */}
                    <div className="flex gap-6 mt-10">
                        {[
                            { value: '66+', label: 'Días de racha máx.' },
                            { value: '8K',  label: 'Hábitos activos' },
                            { value: '76%', label: 'Tasa de adherencia' },
                        ].map(stat => (
                            <div key={stat.label}>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-[10px] font-bold text-blue-300/50 uppercase tracking-widest leading-tight mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-[11px] text-blue-300/30 flex gap-6 font-medium">
                    <span>© {new Date().getFullYear()} QUANTIFY MVP</span>
                    <Link to="/sitemap" className="hover:text-blue-300/60 transition-colors">Sitemap</Link>
                    <Link to="/privacy" className="hover:text-blue-300/60 transition-colors">Privacidad</Link>
                </div>
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="w-full lg:w-[52%] flex flex-col items-center justify-center relative z-20 bg-background">
                <div className="absolute top-[-10%] right-[10%] w-[600px] h-[300px] bg-cyan-400/5 dark:bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="absolute top-4 right-6 lg:top-6 lg:right-10 flex justify-end w-full z-50">
                    <ThemeToggle className="bg-surface shadow-sm border border-gray-200 dark:border-white/5" />
                </div>

                <div className="w-full max-w-[360px] relative z-10 px-4">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="bg-surface p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5">
                            <Logo className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-textPrimary">Quantify.</h1>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight text-textPrimary mb-2 leading-tight">
                            Iniciar Sesión
                        </h2>
                        <p className="text-textMuted text-sm font-medium">Accede al panel de control de tu vida.</p>
                    </div>

                    {authError && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-2xl mb-6 text-xs flex items-start gap-2 backdrop-blur-sm font-medium">
                            <span className="text-sm mt-0.5">⚠️</span>
                            <p>{authError}</p>
                        </div>
                    )}

                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-textPrimary uppercase tracking-wider">Correo</label>
                            <input
                                type="email" name="email"
                                className="input-field py-3 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                placeholder="usuario@quantify.test"
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-danger text-[11px] font-semibold pl-1">{formik.errors.email}</div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-textPrimary uppercase tracking-wider">Contraseña</label>
                                <Link to="/forgot-password" className="text-[11px] font-bold text-primary/70 hover:text-primary transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <input
                                type="password" name="password"
                                className="input-field py-3 text-sm dark:bg-[#111111] dark:border-white/10 dark:focus:border-white/30"
                                placeholder="••••••••"
                                {...formik.getFieldProps('password')}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-danger text-[11px] font-semibold pl-1">{formik.errors.password}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="btn-primary mt-2 flex items-center justify-center gap-2 group text-sm py-3.5"
                        >
                            {formik.isSubmitting ? 'Verificando...' : 'Entrar al Ecosistema'}
                            {!formik.isSubmitting && <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-8">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                        <span className="text-xs text-textMuted font-bold tracking-widest uppercase">O</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                setAuthError('Ocurrió un error al intentar conectarse con Google.');
                            }}
                            theme="outline"
                            shape="circle"
                            text="continue_with"
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
                        <p className="text-sm text-textMuted font-medium">
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
