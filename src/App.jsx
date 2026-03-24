import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import Home from './pages/Home';
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
          {/* <AdBanner /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parada/:stopId" element={<BusStop />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
