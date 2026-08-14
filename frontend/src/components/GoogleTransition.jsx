import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import Logo from './Logo';

const GoogleTransition = () => {
    return (
        <motion.div 
            className="fixed inset-0 z-[10000] bg-background flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="relative flex items-center justify-center w-full h-full gap-4 md:gap-8">
                
                {/* Google Icon moves from left */}
                <motion.div
                    initial={{ x: -100, opacity: 0, scale: 0.8, rotate: -45 }}
                    animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FcGoogle className="w-16 h-16 md:w-24 md:h-24 drop-shadow-2xl" />
                    </motion.div>
                </motion.div>

                {/* Pulsing Dots bridging the two */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex space-x-2 z-10"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div 
                            key={i}
                            className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" 
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} 
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} 
                        />
                    ))}
                </motion.div>

                {/* Quantify Logo moves from right */}
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.8, rotate: 45 }}
                    animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        className="bg-surface p-3 md:p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-white/10"
                    >
                        <Logo className="w-12 h-12 md:w-16 md:h-16 text-textPrimary dark:text-white drop-shadow-2xl" />
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Loading text below */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-1/4 flex flex-col items-center"
            >
                <div className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                    <motion.div 
                        className="h-full bg-primary"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em]">
                    Autenticando Ecosistema...
                </span>
            </motion.div>
        </motion.div>
    );
};

export default GoogleTransition;

