import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { sileo } from 'sileo';
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

    if (newFavorites.includes(stopId)) {
      sileo.success({
        title: '¡Guardado!',
        description: `La parada ${stopName} se añadió a sus favoritos.`,
        position: 'top-center'
      });
    } else {
      sileo.info({
        title: 'Eliminado',
        description: `Se quitó ${stopName} de sus favoritos.`,
        position: 'top-center'
      });
    }
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
        <h2>Salida de:</h2>
        <h2 className="stop-name">{stopName}</h2>
        <button className="favorite-button" onClick={toggleFavorite}>
          <Star size={24} fill={isFavorite ? '#f59e0b' : 'transparent'} color={isFavorite ? '#f59e0b' : 'var(--text-secondary)'} />
        </button>
      </div>

      <BusTimer schedule={schedule} />
    </div>
  );
};

export default BusStop;
