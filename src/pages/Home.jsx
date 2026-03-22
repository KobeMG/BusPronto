import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ChevronRight, Star, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import horarios from '../data/horarios.json';

const stopNames = {
  facultad_educacion: 'Facultad de Educación',
  artes_plasticas: 'Artes Plásticas',
  facultad_odontologia: 'Facultad de Odontología'
};

const Home = () => {
  const [favorites, setFavorites] = useState([]);
  const stops = Object.keys(horarios);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('fav_stops') || '[]');
    setFavorites(saved);
  }, []);

  // Sort stops: favorites first, then the rest
  const sortedStops = [...stops].sort((a, b) => {
    const aFav = favorites.includes(a);
    const bFav = favorites.includes(b);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      <Helmet>
        <title>BusPronto - Horarios de Bus Interno UCR</title>
        <meta name="description" content="Encuentra el próximo bus en BusPronto. Selecciona tu parada y mira el cronómetro en tiempo real." />
      </Helmet>
      <div className="glass-card">
        <h1 className="title">
          <Bus size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Bus Interno UCR (BusPronto)
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem' }}>I Ciclo 2026</p>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Seleccione su parada actual para ver cuánto falta para el próximo bus.
        </p>

        <div className="stop-list">
          {sortedStops.map((stop) => (
            <Link to={`/parada/${stop}`} key={stop} className="stop-link" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {favorites.includes(stop) && <Star size={16} fill="#f59e0b" color="#f59e0b" />}
                <span>{stopNames[stop] || stop.replace('_', ' ')}</span>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </div>

        <div className="announcement">
          <Info size={18} />
          <span>Proximamente se habilitará la opción de instalar la web.</span>
        </div>
      </div>
    </>
  );
};

export default Home;
