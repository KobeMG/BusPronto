import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'sileo/styles.css';
import Home from './pages/Home';
import InternalRoutes from './pages/InternalRoutes';
import ExternalRoutes from './pages/ExternalRoutes';
import ExternalStopsList from './pages/ExternalStopsList';
import BusStop from './pages/BusStop';
import ExternalBusStop from './pages/ExternalBusStop';
import Eventos from './pages/Eventos';
import MainLayout from './components/layout/MainLayout';
import UpdatePrompt from './components/UpdatePrompt';

import Cinema from './pages/Cinema';
import Sponsors from './pages/Sponsors';
import Configuracion from './pages/Configuracion';
import QrRedirect from './pages/QrRedirect';

// Admin — lazy-loaded: chunk separado, solo carga si se navega a /admin
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminIndex = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminIndex })));
const AdminPushNotifications = lazy(() => import('./components/admin/AdminPushNotifications'));
const AdminEvents = lazy(() => import('./components/admin/AdminEvents'));
const AdminAlerts = lazy(() => import('./components/admin/AdminAlerts'));
const AdminCinema = lazy(() => import('./components/admin/AdminCinema'));
const AdminAliads = lazy(() => import('./components/admin/AdminAliads'));
const AdminSuggestions = lazy(() => import('./components/admin/AdminSuggestions'));
const AdminSchedules = lazy(() => import('./components/admin/AdminSchedules'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

const AdminFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
    Cargando panel...
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
          <Routes>
            <Route path="/admin/login" element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<AdminFallback />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }>
              <Route index element={<AdminIndex />} />
              <Route path="notifications" element={<AdminPushNotifications />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="alerts" element={<AdminAlerts />} />
              <Route path="cinema" element={<AdminCinema />} />
              <Route path="aliados" element={<AdminAliads />} />
              <Route path="schedules" element={<AdminSchedules />} />
              <Route path="suggestions" element={<AdminSuggestions />} />
            </Route>
            <Route path="/qr/:stopId" element={<QrRedirect />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rutas-internas" element={<InternalRoutes />} />
              <Route path="/rutas-externas" element={<ExternalRoutes />} />
              <Route path="/rutas-externas/:routeId" element={<ExternalStopsList />} />
              <Route path="/rutas-internas/parada/:stopId" element={<BusStop />} />
              <Route path="/rutas-externas/:routeId/:stopId" element={<ExternalBusStop />} />
              <Route path="/cinema" element={<Cinema />} />
              <Route path="/aliados" element={<Sponsors />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        {/* Prompt de actualización: aparece cuando hay una nueva versión del SW */}
        <UpdatePrompt />
    </QueryClientProvider>
  );
}

export default App;
