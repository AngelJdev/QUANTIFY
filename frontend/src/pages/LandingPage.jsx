import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RotatingText from '../components/RotatingText';
import TextReveal from '../components/TextReveal';
import { FiCheckCircle, FiActivity, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Constant for rotating text
    const heroWords = ["disciplina.", "progreso.", "éxito.", "futuro."];
    
    // Text for scroll reveal
    const revealText = "Neurológicamente, un hábito no toma 21 días. Los estudios demuestran que toma exactamente 66 días matemáticos de adherencia continua para que una acción alcance la automaticidad. Quantify es el motor que te lleva ahí.";

    return (
        <div className="w-full min-h-screen bg-background relative flex flex-col">
            <Navbar />
            
            {/* Ambient Background Glow (Neon Blue Aesthetic) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] right-[5%] w-[40vw] h-[40vw] bg-blue-600/20 dark:bg-blue-600/20 rounded-full blur-[100px] md:blur-[180px] mix-blend-screen dark:mix-blend-screen" />
                <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[100px] md:blur-[160px] mix-blend-screen dark:mix-blend-screen" />
            </div>

            {/* ======== HERO SECTION ======== */}
            <main className="w-full px-6 flex flex-col items-center justify-center pt-[20vh] pb-[10vh] relative z-10">
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="text-center max-w-5xl mx-auto w-full flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface dark:bg-white/5 font-bold text-xs uppercase tracking-widest mb-10 border border-gray-200 dark:border-white/10 shadow-sm text-textPrimary dark:text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Software de Ingeniería Personal
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-[3.5rem] md:text-[5rem] lg:text-[7.5rem] font-black text-textPrimary dark:text-white leading-[1] mb-8 tracking-tighter w-full">
                        La ciencia de<br/>
                        cuantificar tu <br className="md:hidden" />
                        <RotatingText words={heroWords} className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-white dark:to-gray-400" />
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-2xl text-textMuted font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Quantify no es un calendario emocional. Es un motor de datos algorítmico diseñado para medir, iterar y forjar rutinas de alto rendimiento.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link to="/register" className="btn-primary py-4 px-8 text-base shadow-xl shadow-primary/20 flex items-center gap-2 group w-full sm:w-auto">
                            Comenzar Fase 1 
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>
            </main>

            {/* ======== MARQUEE SECTION ======== */}
            <div className="w-full relative z-10 py-10 border-y border-gray-200 dark:border-white/5 bg-surface dark:bg-[#0A0A0A] overflow-hidden flex items-center">
                <div className="absolute left-0 w-24 h-full bg-gradient-to-r from-surface dark:from-[#0A0A0A] to-transparent z-10" />
                <div className="absolute right-0 w-24 h-full bg-gradient-to-l from-surface dark:from-[#0A0A0A] to-transparent z-10" />
                
                <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="flex whitespace-nowrap items-center gap-16 font-black text-gray-300 dark:text-white/10 uppercase tracking-[0.2em] text-2xl md:text-5xl"
                >
                    {/* Repeat content to create infinite scroll illusion */}
                    <span>Diseñado para alto rendimiento</span> • <span>Arquitectura de Adherencia</span> • <span>Tendencias Matemáticas</span> • 
                    <span>Diseñado para alto rendimiento</span> • <span>Arquitectura de Adherencia</span> • <span>Tendencias Matemáticas</span> •
                    <span>Diseñado para alto rendimiento</span> • <span>Arquitectura de Adherencia</span> • <span>Tendencias Matemáticas</span> •
                </motion.div>
            </div>

            {/* ======== STICKY SCROLL. TEXT REVEAL ======== */}
            <section className="relative w-full z-10 bg-background h-[120vh]">
                <div className="sticky top-[10%] h-[80vh] flex items-center justify-center px-6 md:px-12">
                    <TextReveal text={revealText} />
                </div>
            </section>

            {/* ======== BENTO GRID. ANALYTICS ======== */}
            <section className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-32 relative z-10">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-textPrimary dark:text-white tracking-tight mb-4">El estándar Dhero.</h2>
                    <p className="text-textMuted text-lg font-medium max-w-xl">
                        Olvídate de la motivación. Implementamos sistemas puramente matemáticos para medir tu constancia con precisión decimal.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    
                    {/* Big Card - Tasa de Adherencia */}
                    <div className="md:col-span-3 glass-card flex flex-col justify-between p-8 md:p-10 hover:-translate-y-1 transition-transform group bg-gradient-to-br from-surface to-blue-50/50 dark:from-[#111111] dark:to-blue-900/10 overflow-hidden relative min-h-[350px] h-auto border-gray-200 dark:border-white/10 hover:shadow-cyan-500/20 hover:shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/30 rounded-full blur-[80px] -mt-10 -mr-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
                        <div>
                            <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl flex items-center justify-center mb-6 shadow-md border border-gray-100 dark:border-white/10 text-accent">
                                <FiCheckCircle strokeWidth={3} size={28} />
                            </div>
                            <h3 className="text-3xl font-black text-textPrimary dark:text-white mb-3">Tasa de Adherencia</h3>
                            <p className="text-textMuted font-medium text-lg leading-relaxed max-w-md">
                                Formula tu probabilidad de éxito dividiendo tus días cumplidos sobre los programados. Mantén el <span className="text-accent font-bold">80%</span> y el éxito está matemáticamente garantizado.
                            </p>
                        </div>
                        <div className="flex items-end gap-2 mt-8">
                            <span className="text-7xl font-black text-textPrimary dark:text-white tracking-tighter">84</span>
                            <span className="text-3xl font-bold text-accent mb-2">%</span>
                        </div>
                    </div>

                    {/* Medium Card - Tendencias WoW */}
                    <div className="md:col-span-2 glass-card flex flex-col justify-between p-8 md:p-10 hover:-translate-y-1 transition-transform group bg-gradient-to-br from-surface to-gray-50 dark:from-[#0A0A0A] dark:to-blue-900/5 border-gray-200 dark:border-white/10 relative overflow-hidden min-h-[350px] h-auto hover:shadow-blue-500/20 hover:shadow-2xl">
                         <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 dark:bg-blue-600/30 rounded-full blur-[80px] transition-transform group-hover:scale-125 duration-700 pointer-events-none" />
                        <div>
                            <div className="w-14 h-14 bg-white dark:bg-[#111111] rounded-2xl flex items-center justify-center mb-6 shadow-md border border-gray-100 dark:border-white/10 text-primary dark:text-white">
                                <FiTrendingUp strokeWidth={3} size={28} />
                            </div>
                            <h3 className="text-3xl font-black text-textPrimary dark:text-white mb-3">Escaneo WoW</h3>
                            <p className="text-textMuted font-medium text-lg leading-relaxed">
                                (Week-over-Week). El motor audita tu progreso midiendo tu diferencial de esfuerzo actual versus tus 7 días anteriores para prevenir recaídas.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-8 text-success bg-success/10 px-4 py-2 rounded-xl w-max border border-success/20 font-bold shrink-0">
                            <FiTrendingUp strokeWidth={3} />
                            <span>+12% vs. Semana pasada</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== UI MOCKUP SECTION (DHERO AESTHETIC DETAILS) ======== */}
            <section className="w-full bg-surface dark:bg-[#0A0A0A] border-y border-gray-200 dark:border-white/5 py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-16 relative z-20">
                        <h2 className="text-3xl md:text-5xl font-black text-textPrimary dark:text-white tracking-tight mb-4">Ingeniería en cada píxel.</h2>
                        <p className="text-textMuted text-lg font-medium max-w-2xl mx-auto">
                            Una interfaz de diseño minimalista y libre de distracciones. Tu enfoque debe estar en tus hábitos, no en aprender a usar nuestra plataforma.
                        </p>
                    </div>

                    {/* Abstract Framework Mockup */}
                    <div className="w-full max-w-4xl mx-auto h-[400px] border border-gray-200 dark:border-white/10 bg-background dark:bg-[#111111] rounded-2xl shadow-2xl relative z-20 overflow-hidden flex flex-col group">
                        {/* Status Bar */}
                        <div className="w-full h-8 border-b border-gray-200 dark:border-white/10 flex items-center px-4 gap-2 bg-surface dark:bg-[#0A0A0A]">
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20"></div>
                        </div>
                        
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Mockup */}
                            <div className="w-1/4 h-full border-r border-gray-200 dark:border-white/10 p-6 space-y-4 bg-surface dark:bg-[#050505]">
                                <div className="w-full h-8 bg-gray-200 dark:bg-white/10 rounded-xl mb-8 animate-pulse"></div>
                                <div className="w-3/4 h-4 bg-gray-200 dark:bg-white/5 rounded-md"></div>
                                <div className="w-1/2 h-4 bg-gray-200 dark:bg-white/5 rounded-md"></div>
                            </div>
                            
                            {/* Main Content Mockup */}
                            <div className="flex-1 p-8 space-y-6 relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 dark:bg-cyan-500/30 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>
                                
                                <div className="flex justify-between items-center mb-8">
                                    <div className="w-1/3 h-10 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse"></div>
                                    <div className="w-24 h-10 bg-primary/20 dark:bg-primary/30 rounded-xl"></div>
                                </div>
                                
                                {/* Card Rows Mockup */}
                                <div className="w-full h-20 border border-gray-200 dark:border-white/10 rounded-xl flex items-center px-6 justify-between transform group-hover:translate-x-2 transition-transform duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-full"></div>
                                        <div className="w-32 h-6 bg-gray-200 dark:bg-white/10 rounded-md"></div>
                                    </div>
                                    <div className="w-16 h-8 bg-success/20 rounded-full"></div>
                                </div>
                                <div className="w-full h-20 border border-gray-200 dark:border-white/10 rounded-xl flex items-center px-6 justify-between opacity-50 transform group-hover:-translate-x-2 transition-transform duration-500 delay-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-full"></div>
                                        <div className="w-48 h-6 bg-gray-200 dark:bg-white/10 rounded-md"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== STACKED FEATURE CARDS ======== */}
            <section className="w-full bg-background py-32 relative z-10">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="mb-20 text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-black text-textPrimary dark:text-white tracking-tight">Arquitectura modular.</h2>
                        <p className="text-textMuted text-lg mt-6 max-w-xl font-medium">
                            Nuestros ecosistemas están diseñados para recablear tu cerebro mediante estímulos visuales y recompensas algorítmicas.
                        </p>
                    </div>
                    
                    {/* Sticky Container */}
                    <div className="relative w-full">
                        {/* Card 1 */}
                        <div className="sticky top-28 w-full min-h-[400px] h-auto bg-gradient-to-br from-surface to-gray-50 dark:from-[#111111] dark:to-[#0A0A0A] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-2xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden mb-12 transform transition-transform">
                            <div className="z-10 md:w-1/2 mb-10 md:mb-0">
                                <div className="inline-block border border-gray-200 dark:border-white/10 rounded-full px-3 py-1 mb-4 bg-white/50 dark:bg-white/5 backdrop-blur-md text-[10px] font-bold text-textPrimary dark:text-gray-300 uppercase tracking-widest">
                                    Fase 01
                                </div>
                                <h3 className="text-4xl text-textPrimary dark:text-white font-black mb-4">Registro Frictionless</h3>
                                <p className="text-textMuted text-lg font-medium">Anota tus hábitos en menos de 2 segundos. La fricción en la UI es el enemigo silencioso de la constancia a largo plazo.</p>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[80px]" />
                            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 dark:from-blue-600 dark:to-cyan-400 opacity-90 z-10 flex items-center justify-center md:translate-x-10 shadow-xl shadow-cyan-500/20">
                                <FiCheckCircle size={80} className="text-white" />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="sticky top-36 w-full min-h-[400px] h-auto bg-gradient-to-br from-surface to-gray-50 dark:from-[#0A0A0A] dark:to-[#111111] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-2xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden mb-12 transform transition-transform">
                            <div className="z-10 md:w-1/2 mb-10 md:mb-0">
                                <div className="inline-block border border-gray-200 dark:border-white/10 rounded-full px-3 py-1 mb-4 bg-white/50 dark:bg-white/5 backdrop-blur-md text-[10px] font-bold text-textPrimary dark:text-gray-300 uppercase tracking-widest">
                                    Fase 02
                                </div>
                                <h3 className="text-4xl text-textPrimary dark:text-white font-black mb-4">Analítica Predictiva</h3>
                                <p className="text-textMuted text-lg font-medium">No recabamos tu pasado; calculamos tu trayectoria matemática con Scanner WoW para prevenir recaídas.</p>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-[80px]" />
                            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 dark:from-purple-500 dark:to-pink-500 opacity-90 z-10 flex items-center justify-center md:translate-x-10 shadow-xl shadow-purple-500/20">
                                <FiActivity size={80} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== MEGA FOOTER ======== */}
            <footer className="w-full border-t border-gray-200 dark:border-white/5 bg-surface dark:bg-[#050505] pt-24 pb-0 overflow-hidden relative z-10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-20">
                    <div className="md:col-span-2">
                        <div className="inline-block border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 mb-6 bg-white/5 backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-textPrimary dark:text-gray-300 uppercase tracking-widest">ECOSISTEMA QUANTIFY</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-medium text-textMuted dark:text-gray-400 leading-tight max-w-sm">
                            Transformamos ideas en experiencias de data que forjan disciplina y crecimiento.
                        </h3>
                        <p className="text-xs font-bold text-textMuted mt-10 uppercase tracking-widest">
                            Construido bajo estándar Dhero © {new Date().getFullYear()}
                        </p>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                        <h4 className="text-textPrimary dark:text-white font-black mb-4">Plataforma</h4>
                        <Link to="/login" className="text-sm font-bold text-textMuted hover:text-primary dark:hover:text-white transition-colors">Iniciar Sesión</Link>
                        <Link to="/register" className="text-sm font-bold text-textMuted hover:text-primary dark:hover:text-white transition-colors">Empezar Gratis</Link>
                        <Link to="/dashboard" className="text-sm font-bold text-textMuted hover:text-primary dark:hover:text-white transition-colors">Dashboard UI</Link>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h4 className="text-textPrimary dark:text-white font-black mb-4">Legal</h4>
                        <a href="#" className="text-sm font-bold text-textMuted hover:text-gray-900 dark:hover:text-white transition-colors">Política de Privacidad</a>
                        <a href="#" className="text-sm font-bold text-textMuted hover:text-gray-900 dark:hover:text-white transition-colors">Condiciones de Uso</a>
                        <Link to="/sitemap" className="text-sm font-bold text-textMuted hover:text-gray-900 dark:hover:text-white transition-colors">Mapa de Sitio</Link>
                    </div>
                </div>
                
                {/* Mega Typography Cutoff */}
                <div className="w-full relative flex justify-center translate-y-[35%] opacity-[0.03] dark:opacity-5 select-none pointer-events-none z-10 overflow-hidden">
                    <h2 className="text-[20vw] font-black tracking-tighter leading-none text-black dark:text-white whitespace-nowrap">
                        QUANTIFY
                    </h2>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
