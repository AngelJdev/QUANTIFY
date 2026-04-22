import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 fade-in">
            <FiAlertTriangle className="text-danger w-20 h-20 mb-6" />
            <h1 className="text-6xl font-bold text-white mb-2">404</h1>
            <h2 className="text-2xl text-textMuted mb-8">Página no encontrada</h2>
            <p className="text-gray-400 max-w-md mb-8">
                El endpoint o módulo que estás buscando no existe o fue movido de lugar en la arquitectura del sistema.
            </p>
            <Link to="/dashboard" className="btn-primary max-w-[200px]">
                Volver Seguros
            </Link>
        </div>
    );
};

export default NotFound;
