import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ChevronRight, Star } from 'lucide-react';
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
    <div className="glass-card">
      <h1 className="title">
        <Bus size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        BusPronto
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
    </div>
  );
};

export default Home;
