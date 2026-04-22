import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="h-screen flex items-center justify-center text-primary">Cargando...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Redirect to onboarding if needed, unless already on the onboarding page
    if (user?.needsOnboarding && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    if (requireAdmin && user?.rol !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
