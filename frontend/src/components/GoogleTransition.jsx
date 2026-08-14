import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import Logo from './Logo';
import { useEffect, useState } from 'react';

const GoogleTransition = ({ onComplete }) => {
    const [phase, setPhase] = useState(0); // 0 = moving together, 1 = merged & expanding
    
    useEffect(() => {
        // Phase 1 triggers after 1.2s (they meet)
        const t1 = setTimeout(() => setPhase(1), 1200);
        // Complete transition after 2.0s total (reduced wait time)
        const t2 = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [onComplete]);

    return (
        <motion.div 
            className="fixed inset-0 z-[10000] bg-background flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="relative flex items-center justify-center w-full h-full">
                
                <AnimatePresence>
                    {phase === 0 && (
                        <>
                            {/* Google Icon moves from left */}
                            <motion.div
                                key="google-icon"
                                initial={{ x: -200, opacity: 0, scale: 0.8, rotate: -45 }}
                                animate={{ x: -20, opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ x: -200, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute z-10"
                            >
                                <FcGoogle className="w-24 h-24 drop-shadow-2xl" />
                            </motion.div>

                            {/* Quantify Logo moves from right */}
                            <motion.div
                                key="quantify-logo"
                                initial={{ x: 200, opacity: 0, scale: 0.8, rotate: 45 }}
                                animate={{ x: 20, opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ x: 200, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute z-10"
                            >
                                <Logo className="w-24 h-24 text-textPrimary dark:text-white drop-shadow-2xl" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* If the user meant "circle expanding to reveal", we can add a reverse circular clip-path mask to the overlay itself, but the motion.div exit handles the fade out perfectly! */}
            </div>
        </motion.div>
    );
};

export default GoogleTransition;
