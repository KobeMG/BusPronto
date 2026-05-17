import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Smartphone } from 'lucide-react';
import { sileo } from 'sileo';
import { Helmet } from 'react-helmet-async';
import PageHeader from '../components/ui/PageHeader';
import listStyles from '../components/ui/StopsList.module.css';
import { InstallPWAModal } from '../components/InstallPWAModal';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Verificar si ya está ejecutándose como PWA instalada
    const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isStandalonePWA);

    // Si ya se capturó el prompt globalmente en window
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Evento que se dispara una vez la app se instala con éxito en el sistema
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      sileo.success({
        title: '¡Instalación exitosa!',
        description: 'BusPronto se ha instalado correctamente en su dispositivo.',
        position: 'top-center'
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleOpenInstallModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>BusPronto – Horarios Bus UCR en Tiempo Real | Rutas Internas y Externas</title>
        <meta name="description" content="Consulta el próximo bus UCR en tiempo real. Horarios del bus interno UCR y bus externo UCR a Alajuela y Heredia. Cronómetro en vivo para no perder tu bus." />
        <link rel="canonical" href="https://www.buspronto.lat/" />
        <meta property="og:title" content="BusPronto – Horarios Bus UCR en Tiempo Real" />
        <meta property="og:description" content="Consulta el próximo bus UCR en tiempo real. Bus interno UCR y bus externo UCR a Alajuela y Heredia. Cronómetro en vivo." />
        <meta property="og:url" content="https://www.buspronto.lat/" />
        <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
      </Helmet>
      <div className="glass-card">
        <PageHeader
          title="BusPronto (UCR)"

          description={
            <>
              <span style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>I Ciclo 2026</span>
              Seleccione el tipo de consulta que desea realizar.
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
          
          {!isStandalone && (
            <button 
              onClick={handleOpenInstallModal} 
              className={listStyles.stopLink}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                width: '100%', 
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Smartphone size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Instalar BusPronto</span>
              </div>
              <ChevronRight size={20} />
            </button>
          )}
        </div>

      </div>

      <InstallPWAModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onNativeInstallSuccess={() => {
          setIsStandalone(true);
          sileo.success({
            title: '¡Instalación iniciada!',
            description: 'BusPronto se está instalando en su dispositivo.',
            position: 'top-center'
          });
        }}
      />
    </>
  );
};

export default Home;
