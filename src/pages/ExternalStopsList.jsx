import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '../components/ui/PageHeader';
import { useExternalStopsQuery } from '../hooks/useExternalStopsQuery';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ExternalStopsList = () => {
  const { routeId } = useParams();

  const { data: stops = [], isLoading, error } = useExternalStopsQuery(routeId);

  const routeName = routeId ? routeId.charAt(0).toUpperCase() + routeId.slice(1) : '';

  if (error && error.message === 'ROUTE_NOT_SUPPORTED') {
    return (
      <div className="glass-card">
        <Helmet>
          <title>{`Ruta ${routeName} - BusPronto`}</title>
        </Helmet>
        <PageHeader
          title={`Rutas a ${routeName}`}
          showBackButton={true}
          backUrl="/rutas-externas"
          description={`Las paradas para la ruta de ${routeName} aún no están disponibles en el sistema.`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card">
        <PageHeader
          title={`Rutas a ${routeName}`}
          showBackButton={true}
          backUrl="/rutas-externas"
          description={`Hubo un error al cargar las paradas externas.`}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Paradas a ${routeName} - BusPronto`}</title>
        <meta name="description" content={`Seleccione su parada para ir a ${routeName}.`} />
      </Helmet>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <PageHeader
          title={`Rutas de ${routeName}`}
          description="Seleccione desde cuál parada abordará el bus."
          showBackButton={true}
          backUrl="/rutas-externas"
        />

        <div className="stop-list">
          {isLoading ? (
            <LoadingSpinner text="Cargando paradas disponibles..." />
          ) : stops.length > 0 ? (
            stops.map(stop => (
              <Link to={`/rutas-externas/${routeId}/${stop.internal_id || stop.id}`} key={stop.id} className="stop-link" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>{stop.name}</span>
                </div>
                <ChevronRight size={20} />
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron paradas para esta ruta.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ExternalStopsList;
