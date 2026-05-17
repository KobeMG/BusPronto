import { useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';
import styles from './InstallPWAModal.module.css';

/**
 * Detecta la plataforma del usuario para mostrar instrucciones específicas.
 */
function detectPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isSamsung = /samsungbrowser/i.test(ua);
  const isFirefox = /firefox/i.test(ua);

  if (isIOS) return 'ios';
  if (isAndroid && isSamsung) return 'samsung';
  if (isAndroid && isFirefox) return 'android-firefox';
  if (isAndroid) return 'android-chrome';
  return 'desktop';
}

const STEPS = {
  ios: [
    {
      icon: <Share size={22} />,
      label: 'Toque el botón de compartir',
      detail: 'El ícono de cuadrado con flecha hacia arriba en la barra de Safari',
    },
    {
      icon: <PlusSquare size={22} />,
      label: 'Seleccione "Añadir a pantalla de inicio"',
      detail: 'Deslice hacia abajo en el menú hasta encontrar esta opción',
    },
    {
      icon: '📲',
      label: 'Confirme con "Añadir"',
      detail: 'BusPronto aparecerá en su pantalla de inicio como una app nativa',
    },
    {
      icon: '🚌',
      label: '¡Listo! Abra BusPronto desde su pantalla de inicio',
      detail: 'Tendrá acceso rápido a los horarios del bus UCR en cualquier momento',
    },
  ],
  'android-chrome': [
    {
      icon: <MoreVertical size={22} />,
      label: 'Toque el menú de Chrome',
      detail: 'Los tres puntos verticales en la esquina superior derecha',
    },
    {
      icon: <Download size={22} />,
      label: 'Seleccione "Añadir a pantalla de inicio"',
      detail: 'O busque la opción "Instalar aplicación"',
    },
    {
      icon: '📲',
      label: 'Confirme la instalación',
      detail: 'BusPronto aparecerá en su pantalla de inicio',
    },
    {
      icon: '🚌',
      label: '¡Listo! Abra BusPronto desde su pantalla de inicio',
      detail: 'Acceso rápido a los horarios del bus UCR en cualquier momento',
    },
  ],
  samsung: [
    {
      icon: <MoreVertical size={22} />,
      label: 'Toque el menú del navegador',
      detail: 'El ícono de tres líneas en la parte inferior',
    },
    {
      icon: <Download size={22} />,
      label: 'Seleccione "Añadir página a" → "Pantalla de inicio"',
      detail: 'En Samsung Internet encontrará esta opción en el menú',
    },
    {
      icon: '📲',
      label: 'Confirme la instalación',
      detail: 'BusPronto quedará en su pantalla de inicio',
    },
    {
      icon: '🚌',
      label: '¡Listo! Abra BusPronto desde su pantalla de inicio',
      detail: 'Acceso rápido a los horarios del bus UCR en cualquier momento',
    },
  ],
  desktop: [
    {
      icon: <Download size={22} />,
      label: 'Busque el ícono de instalación',
      detail: 'En Chrome/Edge, aparece un ícono de instalación en la barra de dirección',
    },
    {
      icon: '📲',
      label: 'Haga clic en "Instalar"',
      detail: 'BusPronto se instalará como una aplicación de escritorio',
    },
    {
      icon: '🚌',
      label: '¡Listo! Abra BusPronto como app',
      detail: 'Acceso rápido a los horarios del bus UCR sin abrir el navegador',
    },
  ],
};

const PLATFORM_LABELS = {
  ios: { title: 'Instale BusPronto en iPhone', browser: 'Safari' },
  'android-chrome': { title: 'Instale BusPronto en Android', browser: 'Chrome' },
  samsung: { title: 'Instale BusPronto en Android', browser: 'Samsung Internet' },
  'android-firefox': { title: 'Instale BusPronto en Android', browser: 'Firefox' },
  desktop: { title: 'Instale BusPronto', browser: 'su navegador' },
};

export function InstallPWAModal({ isOpen, onClose, deferredPrompt, onNativeInstallSuccess }) {
  const platform = detectPlatform();
  const steps = STEPS[platform] ?? STEPS.desktop;
  const labels = PLATFORM_LABELS[platform] ?? PLATFORM_LABELS.desktop;

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onNativeInstallSuccess) onNativeInstallSuccess();
      }
    } catch (err) {
      console.error('Error al realizar instalación nativa:', err);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className={styles.handle} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>📲</div>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{labels.title}</h2>
            <p className={styles.subtitle}>
              Instale la app para recibir alertas y acceder más rápido
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Beneficios */}
        <div className={styles.benefitsRow}>
          {['Más Rápido', 'Sin App Store', 'Siempre a Mano'].map((b) => (
            <span key={b} className={styles.benefit}>{b}</span>
          ))}
        </div>

        {/* Botón de instalación nativa si está disponible (Android/Desktop) */}
        {deferredPrompt ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
              Su navegador permite instalar BusPronto automáticamente en un solo toque.
            </p>
            <button className={styles.gotItBtn} onClick={handleNativeInstall}>
              Instalar ahora
            </button>
          </div>
        ) : (
          /* Pasos manuales si no hay prompt nativo (iOS / Safari / Firefox) */
          <div className={styles.steps}>
            {steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNumber}>
                  <span>{i + 1}</span>
                </div>
                <div className={styles.stepIcon}>
                  {typeof step.icon === 'string' ? (
                    <span className={styles.emoji}>{step.icon}</span>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className={styles.stepContent}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <p className={styles.stepDetail}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerNote}>
            BusPronto es una PWA — no necesita descargarla de ninguna tienda de aplicaciones.
          </p>
          {!deferredPrompt && (
            <button className={styles.gotItBtn} onClick={onClose}>
              ¡Entendido!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
