import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useInternalStopsQuery } from '../hooks/useInternalStopsQuery';
import { useFavorites } from '../contexts/FavoritesContext';
import PageHeader from '../components/ui/PageHeader';
import listStyles from '../components/ui/StopsList.module.css';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const InternalRoutes = () => {
  const { favorites } = useFavorites();
  const { data: stops = [], isLoading } = useInternalStopsQuery();

  const sortedStops = [...stops].sort((a, b) => {
    const aFav = favorites.includes(a.internal_id || a.id);
    const bFav = favorites.includes(b.internal_id || b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      <Helmet>
        <title>Bus Interno UCR – Horarios en Tiempo Real | BusPronto</title>
        <meta name="description" content="Ver horarios del bus interno UCR. Selecciona tu parada (Facultad Educación, Artes Plásticas, Odontología) y ve cuánto falta para el próximo bus." />
        <link rel="canonical" href="https://www.buspronto.lat/rutas-internas" />
        <meta property="og:title" content="Bus Interno UCR – Horarios en Tiempo Real | BusPronto" />
        <meta property="og:description" content="Horarios del bus interno UCR en tiempo real. Paradas: Facultad Educación, Artes Plásticas, Odontología." />
        <meta property="og:url" content="https://www.buspronto.lat/rutas-internas" />
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
          ) : sortedStops.length > 0 ? (
            sortedStops.map((stop) => (
              <Link to={`/rutas-internas/parada/${stop.internal_id || stop.id}`} key={stop.id} className={listStyles.stopLink} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {favorites.includes(stop.internal_id || stop.id) && <Star size={16} fill="#f59e0b" color="#f59e0b" />}
                  <span>{stop.name}</span>
                </div>
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
