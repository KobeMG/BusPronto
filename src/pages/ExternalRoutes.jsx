import { Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

const ExternalRoutes = () => {
  return (
    <>
      <Helmet>
        <title>Rutas de Buses Externos - BusPronto</title>
        <meta name="description" content="Rutas de buses externos UCR. Próximamente." />
      </Helmet>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <PageHeader 
          title="¡Próximamente!"
          icon={<Clock size={64} color="var(--text-secondary)" style={{ display: 'block', margin: '0 auto 1rem auto' }} />}
          description="Estamos trabajando para traer las rutas de los buses externos de la UCR. ¡Mantente atento a las próximas actualizaciones!"
        />
        
        <Link to="/" className="stop-link" style={{ justifyContent: 'center', width: 'auto', padding: '0.75rem 2rem' }}>
          <span>Volver al menú principal</span>
        </Link>
      </div>
    </>
  );
};

export default ExternalRoutes;
