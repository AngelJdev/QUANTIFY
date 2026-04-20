import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Sitemap from './pages/Sitemap';

const PublicRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="h-screen flex items-center justify-center text-primary">Cargando...</div>;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const ProtectedLayout = () => {
    return (
      <div className="flex flex-1 relative w-full h-full overflow-hidden">
        <Navbar />
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center bg-background h-screen overflow-y-auto">
          <div className="w-full max-w-7xl px-4 py-8 relative">
            <Breadcrumbs />
            <Outlet />
          </div>
          
          <footer className="mt-auto border-t border-gray-200 dark:border-white/5 bg-background py-6 w-full text-center text-xs text-textMuted mt-12 z-10 relative">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8">
              <p>© {new Date().getFullYear()} Quantify MVP - Ingeniería de Personal</p>
              <div className="mt-2 md:mt-0 flex gap-4">
                <a href="/sitemap" className="transition hover:text-primary dark:hover:text-white">Sitemap</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
};

function App() {
  return (
    <Routes>
      {/* Rutas Públicas Estrictas (Si está logueado, expulsa a Dashboard) */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Rutas Protegidas (Con Layout de Aplicación) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Route>
      </Route>

      {/* Seguridad ante rutas huérfanas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
