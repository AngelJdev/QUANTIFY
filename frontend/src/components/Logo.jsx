const Logo = ({ className = "w-8 h-8" }) => {
    // Generar patrón de espirógrafo algorítmico (Wireframe 3 lóbulos) alineado a la nueva imagen
    const lobes = [0, 120, 240];
    const layers = 12;

    return (
        <svg 
            viewBox="0 0 100 100" 
            className={className} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Hacemos que el stroke escuche el currentColor (blanco en Dark Mode, primario en Light Mode) */}
            <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.8">
                {lobes.map((angle) => (
                    <g key={angle} transform={`rotate(${angle} 50 50)`}>
                        {Array.from({ length: layers }).map((_, i) => (
                            <ellipse 
                                key={i} 
                                cx={50} 
                                cy={30 + i * 1.2} 
                                rx={12 + i * 1.5} 
                                ry={25 + i * 0.8} 
                                transform={`rotate(${-i * 3} 50 ${30 + i * 1.2})`}
                            />
                        ))}
                    </g>
                ))}
            </g>
            {/* Nodo central oscuro para darle peso */}
            <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.9" />
        </svg>
    );
};

export default Logo;
