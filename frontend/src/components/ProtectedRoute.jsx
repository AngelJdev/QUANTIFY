import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center text-primary">Cargando...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (requireAdmin && user?.rol !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
