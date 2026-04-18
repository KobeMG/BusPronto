import { ChevronRight } from 'lucide-react';
import listStyles from '../components/ui/StopsList.module.css';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

const ExternalRoutes = () => {
  return (
    <>
      <Helmet>
        <title>Bus Externo UCR – Horarios Alajuela y Heredia | BusPronto</title>
        <meta name="description" content="Horarios del bus externo UCR a Alajuela y Heredia en tiempo real. Selecciona tu destino y ve cuánto falta para el próximo bus externo." />
        <link rel="canonical" href="https://www.buspronto.lat/rutas-externas" />
        <meta property="og:title" content="Bus Externo UCR – Horarios Alajuela y Heredia | BusPronto" />
        <meta property="og:description" content="Horarios del bus externo UCR a Alajuela y Heredia en tiempo real. Cronómetro en vivo." />
        <meta property="og:url" content="https://www.buspronto.lat/rutas-externas" />
        <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
      </Helmet>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <PageHeader
          title="Rutas de Bus Externo"
          description="Seleccione su destino para ver las paradas disponibles."
          showBackButton={true}
        />

        <div className={listStyles.stopList}>
          <Link to={'/rutas-externas/alajuela'} className={listStyles.stopLink} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Alajuela</span>
            </div>
            <ChevronRight size={20} />
          </Link>

          <Link to={'/rutas-externas/heredia'} className={listStyles.stopLink}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Heredia</span>
            </div>
            <ChevronRight size={20} />
          </Link>

          <Link to={'/rutas-externas/tibas'} className={listStyles.stopLink} style={{ opacity: 1, pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Tibás</span>
            </div>
            <ChevronRight size={20} />
          </Link>

        </div>
      </div>
    </>
  );
};

export default ExternalRoutes;
