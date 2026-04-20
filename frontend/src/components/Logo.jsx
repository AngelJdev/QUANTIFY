const Logo = ({ className = "w-8 h-8" }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            className={className} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* The 'Q' Tail */}
            <rect x="55" y="55" width="20" height="35" transform="rotate(-45 55 55)" fill="#0D47A1" />
            
            {/* Círculo base de la 'Q' roto */}
            <path d="M 25 50 c 0 13.8 11.2 25 25 25 c 13.8 0 25 -11.2 25 -25 L 55 50" stroke="#0D47A1" strokeWidth="12" strokeLinecap="square" />
            <path d="M 50 25 C 36.2 25 25 36.2 25 50" stroke="#0D47A1" strokeWidth="12" strokeLinecap="square" />
            
            {/* Las barras de las métricas (derecha arriba) */}
            <rect x="45" y="25" width="8" height="15" fill="#4DD0E1" />
            <rect x="60" y="15" width="10" height="25" fill="#00C853" />
            <rect x="75" y="5" width="12" height="35" fill="#10B981" />
        </svg>
    );
};

export default Logo;
