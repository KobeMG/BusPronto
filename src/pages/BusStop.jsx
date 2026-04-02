import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useInternalStopDetailsQuery } from '../hooks/useInternalStopDetailsQuery';
import { useFavorites } from '../contexts/FavoritesContext';
import BusTimer from '../components/BusTimer';
import PageHeader from '../components/ui/PageHeader';
import styles from '../components/ui/PageHeader.module.css';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Componentes UI
import ViewToggle from '../components/ui/ViewToggle';
import DaySelector from '../components/ui/DaySelector';
import FullScheduleList from '../components/ui/FullScheduleList';

// Hook centralizado
import { useSchedule } from '../hooks/useSchedule';

const BusStop = () => {
  const { stopId } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: stopData, isLoading } = useInternalStopDetailsQuery(stopId);
  
  // Usar el hook centralizado para manejar toda la lógica de horarios y vistas
  const { 
    view, setView, 
    selectedDay, setSelectedDay, 
    schedule, nextBusTime, 
    todayName 
  } = useSchedule(stopData?.formattedSchedules);

  const isFav = isFavorite(stopId);
  const stopName = stopData?.name || stopId?.replace('_', ' ');

  if (isLoading) {
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

  return (
    <div className="glass-card">
      <Helmet>
        <title>{`Salida de ${stopName} - BusPronto`}</title>
        <meta name="description" content={`Consulte el horario y cronómetro en tiempo real para la parada ${stopName}. ¡No pierda su bus!`} />
      </Helmet>
      <PageHeader
        title={
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)', WebkitTextFillColor: 'initial' }}>Salida de:</span>
            <span className={styles.stopName} style={{ margin: 0 }}>{stopName}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem', WebkitTextFillColor: 'initial' }}>
              Tarifa: GRATUITO
            </span>
          </span>
        }
        showBackButton={true}
        backUrl="/rutas-internas"
        actionButton={
          <button className={styles.favoriteButton} onClick={() => toggleFavorite(stopId, stopName)}>
            <Star size={24} fill={isFav ? '#f59e0b' : 'transparent'} color={isFav ? '#f59e0b' : 'var(--text-secondary)'} />
          </button>
        }
      />

      <ViewToggle activeView={view} onViewChange={setView} />

      {view === 'timer' ? (
        schedule.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>
            <p>No hay servicio de buses disponibles para el día de hoy ({todayName}).</p>
          </div>
        ) : (
          <BusTimer schedule={schedule} />
        )
      ) : (
        <>
          <DaySelector selectedDay={selectedDay} onDayChange={setSelectedDay} />
          <FullScheduleList schedule={schedule} nextBusTime={nextBusTime} />
        </>
      )}
    </div>
  );
};

export default BusStop;
