import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useInternalStopsQuery } from '../hooks/useInternalStopsQuery';
import PageHeader from '../components/ui/PageHeader';
import listStyles from '../components/ui/StopsList.module.css';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const InternalRoutes = () => {
  const { data: stops = [], isLoading } = useInternalStopsQuery();

  return (
    <>
      <Helmet>
        <title>Bus Interno UCR – Horarios en Tiempo Real | BusPronto</title>
        <meta name="description" content="Ver horarios del bus interno UCR. Selecciona tu parada (Facultad Educación, Artes Plásticas, Odontología) y ve cuánto falta para el próximo bus." />
        <link rel="canonical" href="https://www.buspronto.lat/rutas-internas" />
        <meta property="og:title" content="Bus Interno UCR – Horarios en Tiempo Real | BusPronto" />
        <meta property="og:description" content="Horarios del bus interno UCR en tiempo real. Paradas: Facultad Educación, Artes Plásticas, Odontología." />
        <meta property="og:url" content="https://www.buspronto.lat/rutas-internas" />
        <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
      </Helmet>
      <div className="glass-card">
        <PageHeader
          title="Rutas de Bus Interno"
          description="Seleccione su parada actual para ver cuánto falta para el próximo bus."
          showBackButton={true}
        />

        <div className={listStyles.stopList}>
          {isLoading ? (
            <LoadingSpinner text="Cargando paradas..." />
          ) : stops.length > 0 ? (
            stops.map((stop) => (
              <Link to={`/rutas-internas/parada/${stop.internal_id || stop.id}`} key={stop.id} className={listStyles.stopLink}>
                <span>{stop.name}</span>
                <ChevronRight size={20} />
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron paradas.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default InternalRoutes;
