import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import listStyles from '../components/ui/StopsList.module.css';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>BusPronto – Horarios Bus UCR en Tiempo Real | Rutas Internas y Externas</title>
        <meta name="description" content="Consulta el próximo bus UCR en tiempo real. Horarios del bus interno UCR y bus externo UCR a Alajuela y Heredia. Cronómetro en vivo para no perder tu bus." />
        <link rel="canonical" href="https://www.buspronto.lat/" />
        <meta property="og:title" content="BusPronto – Horarios Bus UCR en Tiempo Real" />
        <meta property="og:description" content="Consulta el próximo bus UCR en tiempo real. Bus interno UCR y bus externo UCR a Alajuela y Heredia. Cronómetro en vivo." />
        <meta property="og:url" content="https://www.buspronto.lat/" />
      </Helmet>
      <div className="glass-card">
        <PageHeader
          title="BusPronto (UCR)"

          description={
            <>
              <span style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>I Ciclo 2026</span>
              Seleccione el tipo de ruta que desea consultar.
            </>
          }
        />

        <div className={listStyles.stopList}>
          <Link to="/rutas-internas" className={listStyles.stopLink}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Bus Interno UCR</span>
            </div>
            <ChevronRight size={20} />
          </Link>

          <Link to="/rutas-externas" className={listStyles.stopLink}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Bus Externo UCR</span>
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
