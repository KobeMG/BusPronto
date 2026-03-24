import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import './InstallPWA.css';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      // Mostrar después de un pequeño retraso para no ser intrusivo al cargar
      setTimeout(() => setIsVisible(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Para iOS, mostrar si es Safari y no es standalone
    if (ios && !isStandalone) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClickInstall = (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="install-pwa-container">
      <div className="install-pwa-card glass-card">
        <button className="close-install" onClick={() => setIsVisible(false)}>
          <X size={18} />
        </button>
        
        <div className="install-content">
          <div className="install-icon">
            <img src="/logo192x192.png" alt="BusPronto" />
          </div>
          <div className="install-text">
            <h3>Instalar BusPronto</h3>
            <p>Accede más rápido y consulta horarios sin abrir el navegador.</p>
          </div>
        </div>

        {isIOS ? (
          <div className="ios-instructions">
            <p>
              Pulsa el botón <Share size={16} className="inline-icon" /> y luego 
              <strong> "Añadir a la pantalla de inicio"</strong>
            </p>
          </div>
        ) : (
          <button className="install-button" onClick={onClickInstall}>
            <Download size={18} />
            <span>Instalar ahora</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
