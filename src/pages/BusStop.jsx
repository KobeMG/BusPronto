import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
        position: 'top-center',
        duration: 2000
      });
    } else {
      sileo.info({
        title: 'Eliminado',
        description: `Se quitó ${stopName} de sus favoritos.`,
        position: 'top-center',
        duration: 2000
      });
    }
  };

  const schedule = horarios[stopId];
  const stopName = stopNames[stopId] || stopId?.replace('_', ' ');

  if (!schedule) {
    return (
      <div className="glass-card">
        <Helmet>
          <title>Parada no encontrada - BusPronto</title>
        </Helmet>
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

  //const isWeekend = [0, 6].includes(new Date().getDay()); // 0 es domingo, 6 es sábado
  const isWeekend = false; //Dejar asi el primer fin de semana. Para que puedan ver la funcionalidad.
  return (
    <div className="glass-card">
      <Helmet>
        <title>{`Salida de ${stopName} - BusPronto`}</title>
        <meta name="description" content={`Consulte el horario y cronómetro en tiempo real para la parada ${stopName}. ¡No pierda su bus!`} />
      </Helmet>
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

      {isWeekend ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>
          <p>No hay servicio de buses disponibles los fines de semana.</p>
        </div>
      ) : (
        <BusTimer schedule={schedule} />
      )}
    </div>
  );
};


export default BusStop;
