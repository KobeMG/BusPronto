import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bell, MessageSquare } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import BusLogo from '../components/ui/BusLogo';
import listStyles from '../components/ui/StopsList.module.css';
import pageHeaderStyles from '../components/ui/PageHeader.module.css';
import { useAlertsQuery } from '../hooks/useAlertsQuery';
import AlertsModal from '../components/ui/AlertsModal';
import { SugerenciasModal } from '../components/SugerenciasModal';

const computeHasUnseenAlerts = (alerts) => {
  if (alerts.length === 0) return false;
  try {
    const seenIdsString = localStorage.getItem('bp_seen_alerts');
    const seenIds = seenIdsString ? JSON.parse(seenIdsString) : [];
    return alerts.some((alert) => !seenIds.includes(alert.id));
  } catch {
    return false;
  }
};

const Home = () => {
  const { data: alerts = [], isLoading, isError } = useAlertsQuery();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSugerenciasOpen, setIsSugerenciasOpen] = useState(false);
  // ponytail: solo fuerza un re-render al marcar vistas; el resto es estado derivado
  const [, bumpSeen] = useState(0);

  const hasUnseenAlerts = computeHasUnseenAlerts(alerts);

  const handleSeenUpdated = () => {
    bumpSeen((v) => v + 1);
  };

  return (
    <>
      <title>BusPronto – Horarios Bus UCR en Tiempo Real | Rutas Internas y Externas</title>
      <meta name="description" content="Consulta el próximo bus UCR en tiempo real. Horarios del bus interno UCR y bus externo UCR a Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás. Cronómetro en vivo para no perder tu bus." />
      <link rel="canonical" href="https://www.buspronto.lat/" />
      <meta property="og:title" content="BusPronto – Horarios Bus UCR en Tiempo Real" />
      <meta property="og:description" content="Consulta el próximo bus UCR en tiempo real. Bus interno UCR y bus externo UCR a Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas y Tibás. Cronómetro en vivo." />
      <meta property="og:url" content="https://www.buspronto.lat/" />
      <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />

      <div className="glass-card">
        <BusLogo className="home-logo" />
        <PageHeader
          title="BusPronto (UCR)"
          description={
            <>
              <span style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>II Ciclo 2026</span>
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

          <button className={listStyles.stopLink} onClick={() => setIsSugerenciasOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={20} />
              <span>Enviar sugerencia</span>
            </div>
          </button>
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

      <SugerenciasModal
        isOpen={isSugerenciasOpen}
        onClose={() => setIsSugerenciasOpen(false)}
      />
    </>
  );
};

export default Home;
