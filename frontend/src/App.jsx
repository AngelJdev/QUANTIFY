import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import GoogleTransition from './components/GoogleTransition';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OnboardingWizard from './pages/OnboardingWizard';
import NotFound from './pages/NotFound';
import Sitemap from './pages/Sitemap';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import SmartwatchPage from './pages/SmartwatchPage';
import SupportPage from './pages/SupportPage';
import AchievementsPage from './pages/AchievementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';

import PrivacyPolicy from './pages/PrivacyPolicy';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';

const PublicRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Cargando...</div>;
  if (isAuthenticated) {
    return <Navigate to={user?.rol === 0 || user?.rol === 2 ? '/admin-panel' : '/dashboard'} replace />;
  }
  return <Outlet />;
};

const ProtectedLayout = () => {
  return (
    <div className="flex flex-1 relative w-full h-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center bg-background h-screen overflow-y-auto">
        <div className="w-full max-w-7xl px-6 md:px-10 py-8 space-y-8 fade-in">
          <Breadcrumbs />
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const location = useLocation();
  const { globalGoogleTransition, setGlobalGoogleTransition } = useAuth();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AnimatePresence>
        {globalGoogleTransition && (
          <GoogleTransition onComplete={() => setGlobalGoogleTransition(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Rutas de Autenticación */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/smartwatch" element={<SmartwatchPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Solo Administradores y Moderadores */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </GoogleOAuthProvider>
  );
}

export default App;
