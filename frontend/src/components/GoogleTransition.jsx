import { FcGoogle } from 'react-icons/fc';
import Logo from './Logo';

const GoogleTransition = () => {
    return (
        <div className="fixed inset-0 z-[10000] bg-background flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="relative flex items-center justify-center w-full h-full gap-4 md:gap-8">
                
                {/* Google Icon */}
                <div className="z-10 animate-bounce">
                    <FcGoogle className="w-16 h-16 md:w-24 md:h-24 drop-shadow-2xl" />
                </div>

                {/* Pulsing Dots bridging the two */}
                <div className="flex space-x-2 z-10 transition-opacity delay-500">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" style={{ animationDelay: '0.4s' }} />
                </div>

                {/* Quantify Logo */}
                <div className="z-10 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-surface p-3 md:p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-white/10">
                        <Logo className="w-12 h-12 md:w-16 md:h-16 text-textPrimary dark:text-white drop-shadow-2xl" />
                    </div>
                </div>
            </div>
            
            {/* Loading text below */}
            <div className="absolute bottom-1/4 flex flex-col items-center animate-pulse">
                <div className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-3 relative">
                    <div className="absolute top-0 left-0 h-full bg-primary w-1/3 rounded-full animate-[spin_1.5s_linear_infinite]" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em]">
                    Autenticando Ecosistema...
                </span>
            </div>
        </div>
    );
};

export default GoogleTransition;

