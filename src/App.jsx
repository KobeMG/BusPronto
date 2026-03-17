import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BusStop from './pages/BusStop';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/parada/:stopId" element={<BusStop />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
