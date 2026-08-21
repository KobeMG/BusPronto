import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion as Motion, useAnimation, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { calculateSnapX, getAppBounds, trackAdClick, trackAdImpression } from '../utils/adUtils';
import { AD_THEMES } from '../utils/adThemeUtils';
import { useAdsQuery } from '../hooks/useAdsQuery';
import BusinessLinks from './BusinessLinks';
import LogoOrIcon from './LogoOrIcon';
import styles from './AddBubble.module.css';

const SESSION_KEY = 'buspronto_ad_session';
const ROTATION_MS = 10000;

const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { shown: [], impressed: [] };
  } catch {
    return { shown: [], impressed: [] };
  }
};

const pickPhrase = (ad) => {
  if (ad.phrases && ad.phrases.length > 0) {
    return ad.phrases[Math.floor(Math.random() * ad.phrases.length)];
  }
  return '¡Mira esto!';
};

const getBubbleMessage = (ad) =>
  (ad.addBubbleMessage || '').trim() || (ad.description || '').trim() || '';

const AddBubble = () => {
  const [ad, setAd] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isRightSide, setIsRightSide] = useState(true);

  const { data: allAds = [] } = useAdsQuery();
  const adsRaw = useMemo(() => allAds.filter(ad => getBubbleMessage(ad) !== ''), [allAds]);

  const containerRef = useRef(null);
  // ponytail: refs como fuente de verdad de la sesión (evita closures obsoletos en el intervalo de rotación)
  const shownRef = useRef([]);
  const impressedRef = useRef([]);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const session = loadSession();
    shownRef.current = session.shown;
    impressedRef.current = session.impressed;
  }, []);

  const persistSession = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        shown: shownRef.current,
        impressed: impressedRef.current
      }));
    } catch {
      // sin sessionStorage (modo privado), seguimos sin persistir
    }
  }, []);

  const pickNextAd = useCallback((pool) => {
    let unseen = pool.filter(a => !shownRef.current.includes(a.id));
    if (unseen.length === 0) {
      // ponytail: pool agotado, reiniciar rotación
      shownRef.current = [];
      unseen = pool;
    }
    // Mayor prioridad primero; empate = orden original del fetch
    const chosen = [...unseen].sort((a, b) => (Number(b.priority) || 1) - (Number(a.priority) || 1))[0];
    shownRef.current = [...shownRef.current, chosen.id];
    persistSession();
    return chosen;
  }, [persistSession]);

  const controls = useAnimation();
  // Ref para rastrear la posición X real de la burbuja (controls.get no existe en framer-motion)
  const currentXRef = useRef(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (adsRaw.length === 0 || ad) return;
    const chosen = pickNextAd(adsRaw);
    setAd(chosen);
    setPhrase(pickPhrase(chosen));
    setIsOpen(false);
    setShowTooltip(true);
  }, [adsRaw, ad, pickNextAd]);

  // Rotación: avanza al siguiente anuncio cada ROTATION_MS mientras la tarjeta esté cerrada
  useEffect(() => {
    if (adsRaw.length === 0) return;
    const interval = setInterval(() => {
      // ponytail: no rotar con la tarjeta abierta (no cambiar contenido bajo el dedo del usuario)
      if (isOpenRef.current) return;
      const chosen = pickNextAd(adsRaw);
      setAd(chosen);
      setPhrase(pickPhrase(chosen));
      setIsOpen(false);
      setShowTooltip(true);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [adsRaw, pickNextAd]);

  // Impresión real: solo cuando el ad es visible en viewport, una vez por ad por sesión
  useEffect(() => {
    if (!ad) return;
    if (impressedRef.current.includes(ad.id)) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      impressedRef.current = [...impressedRef.current, ad.id];
      persistSession();
      trackAdImpression(ad.id);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting) && !impressedRef.current.includes(ad.id)) {
        impressedRef.current = [...impressedRef.current, ad.id];
        persistSession();
        trackAdImpression(ad.id);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ad, persistSession]);

  // Efecto para manejar la posición inicial, el centrado al abrir y el snap al cerrar
  useEffect(() => {
    // Si no hay ad o el ancho es 0, el componente no se renderiza, no hacemos nada
    if (!ad || windowDimensions.width === 0) return;

    if (isOpen) {
      // Centramos la tarjeta (ancho de 300px definido en CSS)
      // CARD_HEIGHT dinámico: nunca supera el 85% de la pantalla (CSS hace el resto con max-height)
      const CARD_HEIGHT = Math.min(430, windowDimensions.height * 0.85 - 20);
      const { appLeft, appWidth } = getAppBounds(windowDimensions.width);
      const centeredX = appLeft + (appWidth / 2) - 150;
      // Centra verticalmente pero garantiza que el footer siempre sea visible
      const centeredY = Math.max(
        10,
        Math.min(
          (windowDimensions.height - CARD_HEIGHT) / 2,
          windowDimensions.height - CARD_HEIGHT - 16
        )
      );
      currentXRef.current = centeredX;
      controls.start({
        x: centeredX,
        y: centeredY,
        transition: { type: 'spring', stiffness: 200, damping: 25 }
      });
    } else {
      // Al cerrar o al INICIAR, lo mandamos al borde.
      // Usamos setTimeout para que se ejecute justo después del primer render (montaje del DOM)
      const timer = setTimeout(() => {
        const { appRight } = getAppBounds(windowDimensions.width);
        // Usamos el ref para obtener la posición real; fallback al borde derecho en el primer render
        const knownX = currentXRef.current !== null ? currentXRef.current : appRight - 70;
        const snapX = calculateSnapX(knownX, windowDimensions.width);
        const safeY = Math.min(
          Math.max(10, windowDimensions.height / 2),
          windowDimensions.height - 80
        );

        // Sincronizamos isRightSide con la posición calculada
        const { appLeft, appRight: ar } = getAppBounds(windowDimensions.width);
        setIsRightSide(snapX > appLeft + (ar - appLeft) / 2);
        currentXRef.current = snapX;

        controls.start({
          x: snapX,
          y: safeY,
          transition: { type: 'spring', stiffness: 200, damping: 25 }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, isOpen, windowDimensions.width, windowDimensions.height]);



  // Efecto para ocultar el globo de texto automáticamente después de 1.5 segundos. No molestar al usuario bro
  useEffect(() => {
    if (showTooltip && ad) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 1500);
      return () => clearTimeout(tooltipTimer);
    }
  }, [showTooltip, ad]);

  const handleDragEnd = (e, info) => {
    const snapX = calculateSnapX(info.point.x, windowDimensions.width);
    const { appLeft, appRight } = getAppBounds(windowDimensions.width);
    const appCenter = appLeft + (appRight - appLeft) / 2;
    setIsRightSide(snapX > appCenter);
    currentXRef.current = snapX;

    controls.start({
      x: snapX,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    });
  };

  const handleAdClick = (id) => {
    trackAdClick(id);
  };

  if (!ad || windowDimensions.width === 0) return null;

  const bounds = getAppBounds(windowDimensions.width);
  const theme = AD_THEMES[ad.type] || AD_THEMES.default;

  // El tamaño del elemento draggable: 60px burbuja, 300px tarjeta expandida
  const elementSize = isOpen ? 300 : 60;
  const dragConstraints = {
    left: bounds.appLeft + 10,
    right: Math.max(bounds.appLeft + 10, bounds.appRight - elementSize - 10),
    top: 10,
    bottom: windowDimensions.height - elementSize - 10
  };

  return (
    <Motion.div
      ref={containerRef}
      className={styles.container}
      drag={!isOpen}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      onDragStart={() => setShowTooltip(false)}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2000,
        touchAction: 'none',
        '--ad-theme-color': theme.color,
        '--ad-theme-gradient': theme.gradient
      }}
    >
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <Motion.div
            className={`${styles.tooltip} ${isRightSide ? styles.right : styles.left}`}
            initial={{ opacity: 0, scale: 0.8, x: isRightSide ? -20 : 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
          >
            <div className={styles.tooltipContent}>
              {phrase}
              <button
                type="button"
                className={styles.closeTooltip}
                aria-label="Cerrar"
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              >
                <X size={12} />
              </button>
            </div>
            <div className={styles.tooltipTail}></div>
          </Motion.div>
        )}
      </AnimatePresence>

      {!isOpen ? (
        <Motion.button
          type="button"
          className={styles.bubble}
          aria-label={`Ver anuncio: ${ad.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
        >
          <LogoOrIcon logo={ad.logo} fallbackIcon={theme.icon} title={ad.title} className={styles.adLogoBubble} />
        </Motion.button>
      ) : (
        <Motion.div
          className={styles.expandedCard}
          initial={{ opacity: 0, scale: 0.5, borderRadius: 60 }}
          animate={{ opacity: 1, scale: 1, borderRadius: 20 }}
          exit={{ opacity: 0, scale: 0.5, borderRadius: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperExpanded}>
              <LogoOrIcon logo={ad.logo} fallbackIcon={theme.icon} title={ad.title} className={styles.adLogoExpanded} />
            </div>
            <button type="button" className={styles.closeBtn} aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.cardBody}>
            <h4 className={styles.adTitle}>{ad.title}</h4>
            <p className={styles.adDesc}>{getBubbleMessage(ad)}</p>

            {(ad.uber_eats || ad.google_maps || ad.whatsapp) && (
              <BusinessLinks ad={ad} styles={styles} containerClassName={styles.businessLinksExpanded} />
            )}
          </div>

          {ad.link && (
            <div className={styles.cardFooter}>
              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAdClick(ad.id)}
                className={styles.actionBtn}
              >
                {ad.link_text || 'Visitar'}
                <ExternalLink size={16} />
              </a>
            </div>
          )}
        </Motion.div>
      )}
    </Motion.div>
  );
};

export default AddBubble;
