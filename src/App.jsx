import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import Home from './pages/Home';
import InternalRoutes from './pages/InternalRoutes';
import ExternalRoutes from './pages/ExternalRoutes';
import BusStop from './pages/BusStop';
import Footer from './components/Footer';
import useTheme from './hooks/useTheme';
import AdBanner from './components/AdBanner';

function App() {
  // Aplicar tema automáticamente según la temporada
  //useTheme(); 

  return (
    <>
      <Router>
        <div className="app-container">
          <Toaster position="top-right" />
          <AdBanner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rutas-internas" element={<InternalRoutes />} />
            <Route path="/rutas-externas" element={<ExternalRoutes />} />
            <Route path="/rutas-internas/parada/:stopId" element={<BusStop />} />

            {/* Catch-all: cualquier otra ruta redirige al menú principal (Home) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
