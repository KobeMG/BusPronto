import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'sileo/styles.css';
import Home from './pages/Home';
import InternalRoutes from './pages/InternalRoutes';
import ExternalRoutes from './pages/ExternalRoutes';
import BusStop from './pages/BusStop';
import useTheme from './hooks/useTheme';
import { FavoritesProvider } from './contexts/FavoritesContext';
import MainLayout from './components/layout/MainLayout';

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
            <Route path="/rutas-internas/parada/:stopId" element={<BusStop />} />

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
