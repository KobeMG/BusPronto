import { Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ExternalRoutes = () => {
  return (
    <>
      <Helmet>
        <title>Rutas de Buses Externos - BusPronto</title>
        <meta name="description" content="Rutas de buses externos UCR. Próximamente." />
      </Helmet>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <Clock size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }} />
        <h1 className="title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          ¡Próximamente!
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
          Estamos trabajando para traer las rutas de los buses externos de la UCR. ¡Mantente atento a las próximas actualizaciones!
        </p>
        
        <Link to="/" className="stop-link" style={{ justifyContent: 'center', width: 'auto', padding: '0.75rem 2rem' }}>
          <span>Volver al menú principal</span>
        </Link>
      </div>
    </>
  );
};

export default ExternalRoutes;
