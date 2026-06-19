import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bell } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '../components/ui/PageHeader';
import BusLogo from '../components/ui/BusLogo';
import listStyles from '../components/ui/StopsList.module.css';
import pageHeaderStyles from '../components/ui/PageHeader.module.css';
import { useAlertsQuery } from '../hooks/useAlertsQuery';
import AlertsModal from '../components/ui/AlertsModal';

const Home = () => {
  const { data: alerts = [], isLoading, isError } = useAlertsQuery();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [hasUnseenAlerts, setHasUnseenAlerts] = useState(false);

  useEffect(() => {
    if (alerts.length > 0) {
      try {
        const seenIdsString = localStorage.getItem('bp_seen_alerts');
        const seenIds = seenIdsString ? JSON.parse(seenIdsString) : [];
        const hasUnseen = alerts.some((alert) => !seenIds.includes(alert.id));
        setHasUnseenAlerts(hasUnseen);
      } catch (err) {
        console.warn('Error reading seen alerts from localStorage:', err);
      }
    } else {
      setHasUnseenAlerts(false);
    }
  }, [alerts]);

  const handleSeenUpdated = () => {
    setHasUnseenAlerts(false);
  };

  return (
    <>
      <Helmet>
        <title>BusPronto – Horarios Bus UCR en Tiempo Real | Rutas Internas y Externas</title>
        <meta name="description" content="Consulta el próximo bus UCR en tiempo real. Horarios del bus interno UCR and bus externo UCR a Alajuela y Heredia. Cronómetro en vivo para no perder tu bus." />
        <link rel="canonical" href="https://www.buspronto.lat/" />
        <meta property="og:title" content="BusPronto – Horarios Bus UCR en Tiempo Real" />
        <meta property="og:description" content="Consulta el próximo bus UCR en tiempo real. Bus interno UCR y bus externo UCR a Alajuela y Heredia. Cronómetro en vivo." />
        <meta property="og:url" content="https://www.buspronto.lat/" />
        <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
      </Helmet>
      
      <div className="glass-card">
        <BusLogo className="home-logo" />
        <PageHeader
          title="BusPronto (UCR)"
          description={
            <>
              <span style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>I Ciclo 2026</span>
              Seleccione el tipo de consulta que desea realizar.
            </>
          }
          actionButton={
              <button 
              className={pageHeaderStyles.actionButton}
              onClick={() => setIsAlertsOpen(true)} 
              title="Alertas de Autobús"
              style={{ position: 'relative' }}
              id="alerts-bell-btn"
            >
              <Bell size={22} className={hasUnseenAlerts ? pageHeaderStyles.ring : ''} />
              {hasUnseenAlerts && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid rgba(30, 35, 45, 0.95)',
                    boxShadow: '0 0 8px #ef4444'
                  }} 
                  id="alerts-bell-badge"
                />
              )}
            </button>
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
      </div>

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        loading={isLoading}
        error={isError}
        onSeenUpdated={handleSeenUpdated}
      />
    </>
  );
};

export default Home;
