import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ChevronRight, Star, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getStops } from '../Utils/supabaseQueries';

const Home = () => {
  const [favorites, setFavorites] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStopsData = async () => {
      try {
        const data = await getStops();
        setStops(data);
      } catch (err) {
        console.error('Error fetching stops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStopsData();
    const saved = JSON.parse(localStorage.getItem('fav_stops') || '[]');
    setFavorites(saved);
  }, []);

  // Sort stops: favorites first, then the rest
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
        <title>BusPronto - Horarios de Bus Interno UCR</title>
        <meta name="description" content="Encuentra el próximo bus en BusPronto. Selecciona tu parada y mira el cronómetro en tiempo real." />
      </Helmet>
      <div className="glass-card">
        <h1 className="title">
          <Bus size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Bus Interno UCR (BusPronto)
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem' }}>I Ciclo 2026</p>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Seleccione su parada actual para ver cuánto falta para el próximo bus.
        </p>

        <div className="stop-list">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando paradas...</p>
          ) : sortedStops.length > 0 ? (
            sortedStops.map((stop) => (
              <Link to={`/parada/${stop.internal_id || stop.id}`} key={stop.id} className="stop-link" style={{ position: 'relative' }}>
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

        <div className="announcement">
          <Info size={18} />
          <span>¡Opción de Instalación Disponible!</span>
        </div>
      </div>
    </>
  );
};

export default Home;
