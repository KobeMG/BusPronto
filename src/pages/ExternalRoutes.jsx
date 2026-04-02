import { ChevronRight } from 'lucide-react';
import listStyles from '../components/ui/StopsList.module.css';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

const ExternalRoutes = () => {
  return (
    <>
      <Helmet>
        <title>Rutas de Buses Externos - BusPronto</title>
        <meta name="description" content="Rutas de buses externos UCR." />
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

          {/* <Link to={'#'} className={listStyles.stopLink} style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Alajuelita - PRÓXIMAMENTE</span>
            </div>
            <ChevronRight size={20} />
          </Link> */}


          <Link to={'/rutas-externas/heredia'} className={listStyles.stopLink}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Heredia</span>
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default ExternalRoutes;
