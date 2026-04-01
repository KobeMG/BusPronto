import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useFavorites } from '../contexts/FavoritesContext';
import { useExternalStopDetailsQuery } from '../hooks/useExternalStopDetailsQuery';
import BusTimer from '../components/BusTimer';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ExternalBusStop = () => {
    const { routeId, stopId } = useParams();
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    // Llama al hook genérico para buscar datos
    const { data: stopData, isLoading, error } = useExternalStopDetailsQuery(routeId, stopId);
    
    const schedule = stopData?.formattedSchedules || [];

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

    //const isWeekend = [0, 6].includes(new Date().getDay()); // 0 es domingo, 6 es sábado
    const isWeekend = false; //Dejar asi para pruebas locales.
    
    return (
        <div className="glass-card">
            <Helmet>
                <title>{`Salida de ${stopName} - BusPronto`}</title>
                <meta name="description" content={`Consulte el horario y cronómetro en tiempo real para la ruta de ${stopName}. ¡No pierda su bus!`} />
            </Helmet>
            <PageHeader 
                title={
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Salida externa hacia:</span>
                        <span className="stop-name" style={{ margin: 0 }}>{stopName}</span>
                    </span>
                }
                showBackButton={true}
                backUrl={`/rutas-externas/${routeId}`}
                actionButton={
                    <button className="favorite-button" onClick={() => toggleFavorite(favId, stopName)}>
                        <Star size={24} fill={isFav ? '#f59e0b' : 'transparent'} color={isFav ? '#f59e0b' : 'var(--text-secondary)'} />
                    </button>
                }
            />

            {isWeekend ? (
                <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>
                    <p>No hay servicio de buses externos disponibles los fines de semana.</p>
                </div>
            ) : (
                <BusTimer schedule={schedule} />
            )}
        </div>
    );
};

export default ExternalBusStop;
