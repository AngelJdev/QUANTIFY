import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <header className="text-center space-y-4">
                        <div className="inline-flex p-4 bg-primary/10 rounded-full text-primary mb-4">
                            <FiShield size={48} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-textPrimary dark:text-white tracking-tight">
                            Aviso de Privacidad Integral
                        </h1>
                        <p className="text-textMuted uppercase text-xs font-black tracking-widest">
                            Cumplimiento LFPDPPP - México
                        </p>
                    </header>

                    <section className="bg-surface dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-textPrimary dark:text-white">
                                <FiLock /> 1. Identidad y Responsable
                            </h2>
                            <p className="text-textMuted leading-relaxed">
                                <strong>Quantify Intelligence</strong> con domicilio en la ciudad de Xicotepec de Juarez, Puebla, es responsable del tratamiento de sus datos personales, en estricto cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-textPrimary dark:text-white">
                                <FiEye /> 2. Datos Personales Recabados
                            </h2>
                            <p className="text-textMuted leading-relaxed">
                                Para la operación de ingeniería de personal, recabamos los siguientes datos bajo consentimiento explícito:
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase tracking-tight text-textPrimary dark:text-gray-300">
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <FiCheckCircle className="text-primary" /> Datos de Identificación (Nombre, Email)
                                </li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <FiCheckCircle className="text-primary" /> Datos Biométricos (Edad, Peso, Estatura)
                                </li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <FiCheckCircle className="text-primary" /> Hábitos y Estilo de Vida
                                </li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <FiCheckCircle className="text-primary" /> Historial de Metas Diarias
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-6 border-l-4 border-primary pl-6 py-2">
                            <h2 className="text-2xl font-bold text-textPrimary dark:text-white">
                                3. Finalidad del Tratamiento
                            </h2>
                            <p className="text-textMuted leading-relaxed">
                                Sus datos biométricos y de hábitos se utilizarán exclusivamente para:
                                <br />• Generación de recomendaciones personalizadas de bienestar.
                                <br />• Análisis prospectivo de adherencia a objetivos.
                                <br />• Gamificación y entrega de logros por desempeño.
                                <br /><strong>Nota:</strong> Quantify NO comparte sus datos bio-sensibles con terceros con fines comerciales.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-textPrimary dark:text-white">
                                4. Derechos ARCO
                            </h2>
                            <p className="text-textMuted leading-relaxed">
                                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos. Para ejercer estos derechos o revocar su consentimiento, puede contactar a nuestro oficial de privacidad en la sección de Soporte de la aplicación.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-white/10 text-center">
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-widest leading-loose">
                                ÚLTIMA ACTUALIZACIÓN: {new Date().toLocaleDateString('es-MX')} <br />
                                QUANTIFY INTELLIGENCE - ENGINE v1.2
                            </p>
                        </div>
                    </section>
                </motion.div>
            </main>
        </div>
    );
}
