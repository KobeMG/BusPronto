import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useFavorites } from '../contexts/FavoritesContext';
import { useExternalStopDetailsQuery } from '../hooks/useExternalStopDetailsQuery';
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

const ExternalBusStop = () => {
    const { routeId, stopId } = useParams();
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const { data: stopData, isLoading, error } = useExternalStopDetailsQuery(routeId, stopId);

    // Migración a hook centralizado para limpieza del componente
    const { 
        view, setView, 
        selectedDay, setSelectedDay, 
        schedule, nextBusTime, 
        todayName 
    } = useSchedule(stopData?.formattedSchedules);

    const currentFare = stopData?.formattedSchedules?.find(s => s.fare != null)?.fare;

    // Combine routeId + stopId for favorites mapping
    const favId = `${routeId}_${stopId}`;
    const isFav = isFavorite(favId);

    const stopName = stopData?.name || routeId?.toUpperCase();

    if (error && error.message === 'ROUTE_NOT_SUPPORTED') {
        return (
            <div className="glass-card">
                <PageHeader
                    title="Ruta no soportada"
                    showBackButton={true}
                    backUrl="/rutas-externas"
                    description={`La ruta ${routeId} aún no está implementada completamente.`}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="glass-card">
                <LoadingSpinner text="Cargando información de la parada externa..." />
            </div>
        );
    }

    if (!stopData) {
        return (
            <div className="glass-card">
                <Helmet>
                    <title>Ruta no encontrada - BusPronto</title>
                </Helmet>
                <PageHeader
                    title="Ruta no encontrada"
                    showBackButton={true}
                    backUrl="/rutas-externas"
                    description="No se encontraron horarios para esta ruta externa en el sistema."
                />
            </div>
        );
    }

    return (
        <div className="glass-card">
            <Helmet>
                <title>{`Rutas de ${stopName} - BusPronto`}</title>
                <meta name="description" content={`Consulte el horario y cronómetro en tiempo real para la ruta de ${stopName}. ¡No pierda su bus!`} />
            </Helmet>
            <PageHeader
                title={
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)', WebkitTextFillColor: 'initial' }}>Salida externa desde:</span>
                        <span className={styles.stopName} style={{ margin: 0 }}>{stopName}</span>
                        {currentFare && (
                            <span style={{ fontSize: '1rem', color: 'var(--error)', marginTop: '0.25rem', WebkitTextFillColor: 'initial' }}>
                                Tarifa: ₡{currentFare}
                            </span>
                        )}
                    </span>
                }
                showBackButton={true}
                backUrl={`/rutas-externas/${routeId}`}
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

export default ExternalBusStop;
