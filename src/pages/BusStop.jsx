import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getStopById } from '../utils/supabaseQueries';
import { useFavorites } from '../contexts/FavoritesContext';
import BusTimer from '../components/BusTimer';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BusStop = () => {
  const { stopId } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [stopData, setStopData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFav = isFavorite(stopId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtenemos la parada y sus horarios en una sola llamada (ahora getStopById hace el join)
        const stop = await getStopById(stopId);
        setStopData(stop);
        setSchedule(stop.formattedSchedules || []);
      } catch (err) {
        console.error('Error fetching stop data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stopId]);



  const stopName = stopData?.name || stopId?.replace('_', ' ');

  if (loading) {
    return (
      <div className="glass-card">
        <LoadingSpinner text="Cargando información de la parada..." />
      </div>
    );
  }

  if (!stopData) {
    return (
      <div className="glass-card">
        <Helmet>
          <title>Parada no encontrada - BusPronto</title>
        </Helmet>
        <PageHeader 
          title="Parada no encontrada"
          showBackButton={true}
          backUrl="/rutas-internas"
          description="No se encontraron horarios para esta ubicación en el sistema."
        />
      </div>
    );
  }

  //const isWeekend = [0, 6].includes(new Date().getDay()); // 0 es domingo, 6 es sábado
  const isWeekend = false; //Dejar asi para pruebas locales.
  return (
    <div className="glass-card">
      <Helmet>
        <title>{`Salida de ${stopName} - BusPronto`}</title>
        <meta name="description" content={`Consulte el horario y cronómetro en tiempo real para la parada ${stopName}. ¡No pierda su bus!`} />
      </Helmet>
      <PageHeader 
        title={
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Salida de:</span>
            <span className="stop-name" style={{ margin: 0 }}>{stopName}</span>
          </span>
        }
        showBackButton={true}
        backUrl="/rutas-internas"
        actionButton={
          <button className="favorite-button" onClick={() => toggleFavorite(stopId, stopName)}>
            <Star size={24} fill={isFav ? '#f59e0b' : 'transparent'} color={isFav ? '#f59e0b' : 'var(--text-secondary)'} />
          </button>
        }
      />

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
