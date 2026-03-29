import { Link } from 'react-router-dom';
import { Bus, ChevronRight, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStopsQuery } from '../hooks/useStopsQuery';
import { useFavorites } from '../contexts/FavoritesContext';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const InternalRoutes = () => {
  const { favorites } = useFavorites();
  const { data: stops = [], isLoading } = useStopsQuery();

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
        <title>Rutas de Bus Interno - BusPronto</title>
        <meta name="description" content="Selecciona tu parada del bus interno UCR." />
      </Helmet>
      <div className="glass-card">
        <PageHeader
          title="Rutas de Bus Interno"
          // icon={<Bus size={32} />}
          description="Seleccione su parada actual para ver cuánto falta para el próximo bus."
          showBackButton={true}
        />

        <div className="stop-list">
          {isLoading ? (
            <LoadingSpinner text="Cargando paradas..." />
          ) : sortedStops.length > 0 ? (
            sortedStops.map((stop) => (
              <Link to={`/rutas-internas/parada/${stop.internal_id || stop.id}`} key={stop.id} className="stop-link" style={{ position: 'relative' }}>
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
