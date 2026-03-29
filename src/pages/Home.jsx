import { Link } from 'react-router-dom';
import { Bus, MapPin, ChevronRight, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '../components/ui/PageHeader';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>BusPronto - Menú Principal</title>
        <meta name="description" content="Horarios de buses UCR. Elige entre rutas internas o externas." />
      </Helmet>
      <div className="glass-card">
        <PageHeader 
          title="BusPronto (UCR)" 
          icon={<Bus size={32} />}
          description={
            <>
              <span style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>I Ciclo 2026</span>
              Seleccione el tipo de ruta que desea consultar.
            </>
          }
        />

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
