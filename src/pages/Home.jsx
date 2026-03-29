import { Link } from 'react-router-dom';
import { Bus, MapPin, ChevronRight, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>BusPronto - Menú Principal</title>
        <meta name="description" content="Horarios de buses UCR. Elige entre rutas internas o externas." />
      </Helmet>
      <div className="glass-card">
        <h1 className="title">
          <Bus size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          BusPronto (UCR)
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem' }}>I Ciclo 2026</p>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Seleccione el tipo de ruta que desea consultar.
        </p>

        <div className="stop-list">
          <Link to="/rutas-internas" className="stop-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bus size={24} color="var(--primary-color)" />
              <span>Rutas de bus interno</span>
            </div>
            <ChevronRight size={20} />
          </Link>

          <Link to="/rutas-externas" className="stop-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={24} color="var(--primary-color)" />
              <span>Rutas de buses externos</span>
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>

        {/* <div className="announcement" style={{ marginTop: '2rem' }}>
          <Info size={18} />
          <span>¡Opción de Instalación Disponible!</span>
        </div> */}
      </div>
    </>
  );
};

export default Home;
