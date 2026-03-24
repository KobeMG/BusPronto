import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import Home from './pages/Home';
import BusStop from './pages/BusStop';
import Footer from './components/Footer';
import InstallPWA from './components/InstallPWA';

function App() {
  return (
    <>
      <Router>
        <div className="app-container">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parada/:stopId" element={<BusStop />} />
          </Routes>
          <Footer />
          <InstallPWA />
        </div>
      </Router>
    </>
  );
}

export default App;
