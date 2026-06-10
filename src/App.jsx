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
import { FavoritesProvider } from './contexts/FavoritesContext';
import MainLayout from './components/layout/MainLayout';

import Cinema from './pages/Cinema';
import Sponsors from './pages/Sponsors';
import Configuracion from './pages/Configuracion';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import QrRedirect from './pages/QrRedirect';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

export default App;
