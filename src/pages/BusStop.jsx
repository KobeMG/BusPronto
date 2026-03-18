import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import horarios from '../data/horarios.json';
import BusTimer from '../components/BusTimer';

const stopNames = {
  facultad_educacion: 'Facultad de Educación',
  artes_plasticas: 'Artes Plásticas',
  facultad_odontologia: 'Facultad de Odontología'
};

const BusStop = () => {
  const { stopId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('fav_stops') || '[]');
    setIsFavorite(favorites.includes(stopId));
  }, [stopId]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('fav_stops') || '[]');
    let newFavorites;
    if (favorites.includes(stopId)) {
      newFavorites = favorites.filter(id => id !== stopId);
    } else {
      newFavorites = [...favorites, stopId];
    }
    localStorage.setItem('fav_stops', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const schedule = horarios[stopId];
  const stopName = stopNames[stopId] || stopId?.replace('_', ' ');

  if (!schedule) {
    return (
      <div className="glass-card">
        <div className="header">
          <button onClick={() => navigate('/')} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h2 className="stop-name">Parada no encontrada</h2>
        </div>
        <p>No se encontraron horarios para esta ubicación.</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h2 className="stop-name">{stopName}</h2>
        <button className="favorite-button" onClick={toggleFavorite} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: isFavorite ? '#f59e0b' : 'var(--text-secondary)' }}>
          <Star size={24} fill={isFavorite ? '#f59e0b' : 'transparent'} />
        </button>
      </div>

      <BusTimer schedule={schedule} />
    </div>
  );
};

export default BusStop;
