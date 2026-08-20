import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-gray-200 dark:border-white/5 bg-background py-8 w-full text-center text-xs text-textMuted z-10 relative">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-wrap justify-between items-center px-6 md:px-8 gap-6 md:gap-0">
                <div className="space-y-1 text-center md:text-left">
                    <p className="font-extrabold text-primary dark:text-white uppercase tracking-tighter">Quantify Intelligence</p>
                    <p className="text-[10px] sm:text-xs">© {new Date().getFullYear()} - Ingeniería de Personal Bio-Sincrónica</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 font-bold uppercase tracking-widest text-[10px]">
                    <Link to="/privacy" className="transition hover:text-primary dark:hover:text-white border-b border-transparent hover:border-primary whitespace-nowrap">
                        Aviso de Privacidad
                    </Link>
                    <Link to="/sitemap" className="transition hover:text-primary dark:hover:text-white border-b border-transparent hover:border-primary whitespace-nowrap">
                        Sitemap
                    </Link>
                </div>
            </div>
        </footer>
    );
}
