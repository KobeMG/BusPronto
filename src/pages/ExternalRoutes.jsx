import { ChevronRight } from 'lucide-react';
import listStyles from '../components/ui/StopsList.module.css';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { EXTERNAL_ROUTES } from '../services/externalRoute.service';

const ExternalRoutes = () => {
  return (
    <>
      <title>Bus Externo UCR – Horarios Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás | BusPronto</title>
      <meta name="description" content="Horarios del bus externo UCR a Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás en tiempo real. Selecciona tu destino y ve cuánto falta para el próximo bus externo." />
      <link rel="canonical" href="https://www.buspronto.lat/rutas-externas" />
      <meta property="og:title" content="Bus Externo UCR – Horarios Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás | BusPronto" />
      <meta property="og:description" content="Horarios del bus externo UCR a Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás en tiempo real. Cronómetro en vivo." />
      <meta property="og:url" content="https://www.buspronto.lat/rutas-externas" />
      <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <PageHeader
          title="Rutas de Bus Externo"
          description="Seleccione su destino para ver las paradas disponibles."
          showBackButton={true}
        />

        <div className={listStyles.stopList}>
          {EXTERNAL_ROUTES.map((route) => (
            <Link to={`/rutas-externas/${route.id}`} key={route.id} className={listStyles.stopLink}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>{route.name}</span>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExternalRoutes;
