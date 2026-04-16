import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'sileo/styles.css';
import Home from './pages/Home';
import InternalRoutes from './pages/InternalRoutes';
import ExternalRoutes from './pages/ExternalRoutes';
import ExternalStopsList from './pages/ExternalStopsList';
import BusStop from './pages/BusStop';
import ExternalBusStop from './pages/ExternalBusStop';
import SemanaU from './pages/SemanaU';
//import useTheme from './hooks/useTheme';
import { FavoritesProvider } from './contexts/FavoritesContext';
import MainLayout from './components/layout/MainLayout';

import Cinema from './pages/Cinema';
import About from './pages/About';

const queryClient = new QueryClient();

function App() {
  // Aplicar tema automáticamente según la temporada
  //useTheme(); 

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rutas-internas" element={<InternalRoutes />} />
              <Route path="/rutas-externas" element={<ExternalRoutes />} />
              <Route path="/rutas-externas/:routeId" element={<ExternalStopsList />} />
              <Route path="/rutas-internas/parada/:stopId" element={<BusStop />} />
              <Route path="/rutas-externas/:routeId/:stopId" element={<ExternalBusStop />} />
              <Route path="/semana-u" element={<SemanaU />} />
              <Route path="/cinema" element={<Cinema />} />
              <Route path="/acerca" element={<About />} />

              {/* Catch-all: cualquier otra ruta redirige al menú principal (Home) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

export default App;
