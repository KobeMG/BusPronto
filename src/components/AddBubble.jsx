import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import { calculateSnapX, getAppBounds, trackAdClick, trackAdImpression } from '../utils/adUtils';
import { AD_THEMES } from '../utils/adThemeUtils';
import { useAdsQuery } from '../hooks/useAdsQuery';
import ImageCarousel from './ui/ImageCarousel';
import styles from './AddBubble.module.css';

const LogoOrIcon = ({ logo, fallbackIcon, title, className }) => {
  const [hasError, setHasError] = useState(false);

  if (logo && !hasError) {
    return (
      <img
        src={logo}
        alt={title}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return fallbackIcon;
};



const AddBubble = () => {
  const [ad, setAd] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isRightSide, setIsRightSide] = useState(true);

  const { data: allAds = [] } = useAdsQuery();
  const adsRaw = useMemo(() => allAds.filter(ad => ad.addBubbleMessage && ad.addBubbleMessage.trim() !== ''), [allAds]);

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
    if (adsRaw.length > 0 && !ad) {
      const randomAd = adsRaw[Math.floor(Math.random() * adsRaw.length)];
      
      let randomPhrase = '¡Mira esto!';
      if (randomAd.phrases && randomAd.phrases.length > 0) {
        randomPhrase = randomAd.phrases[Math.floor(Math.random() * randomAd.phrases.length)];
      }

      const timer = setTimeout(() => {
        setAd(randomAd);
        setPhrase(randomPhrase);
        // Contabilizar impresión: el anuncio fue seleccionado y se mostrará al usuario
        trackAdImpression(randomAd.id);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [adsRaw, ad]);

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
    <motion.div
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
          <motion.div
            className={`${styles.tooltip} ${isRightSide ? styles.right : styles.left}`}
            initial={{ opacity: 0, scale: 0.8, x: isRightSide ? -20 : 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
          >
            <div className={styles.tooltipContent}>
              {phrase}
              <button
                className={styles.closeTooltip}
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              >
                <X size={12} />
              </button>
            </div>
            <div className={styles.tooltipTail}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen ? (
        <motion.div
          className={styles.bubble}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
        >
          <LogoOrIcon logo={ad.logo} fallbackIcon={theme.icon} title={ad.title} className={styles.adLogoBubble} />
          {(ad.uber_eats || ad.google_maps || ad.whatsapp) && (
            <div className={styles.indicators}>
              {ad.whatsapp && (
                <div className={`${styles.indicator} ${styles.whatsappIndicator}`} title="WhatsApp">
                  <MessageCircle size={8} />
                </div>
              )}
              {ad.uber_eats && (
                <div className={`${styles.indicator} ${styles.uberIndicator}`} title="Uber Eats">
                  <ShoppingBag size={8} />
                </div>
              )}
              {ad.google_maps && (
                <div className={`${styles.indicator} ${styles.mapsIndicator}`} title="Google Maps">
                  <MapPin size={8} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
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
            <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.cardBody}>
            <h4 className={styles.adTitle}>{ad.title}</h4>
            <p className={styles.adDesc}>{ad.addBubbleMessage}</p>
            <ImageCarousel
              className={styles.carouselContainer}
              images={ad.images}
              title={ad.title}
            />

            {(ad.uber_eats || ad.google_maps || ad.whatsapp) && (
              <div className={styles.businessLinksExpanded}>
                {ad.whatsapp && (
                  <a
                    href={`https://wa.me/${ad.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.businessLink} ${styles.whatsapp}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdClick(ad.id);
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}
                {ad.uber_eats && (
                  <a
                    href={ad.uber_eats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.businessLink} ${styles.uberEats}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdClick(ad.id);
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Uber Eats</span>
                  </a>
                )}
                {ad.google_maps && (
                  <a
                    href={ad.google_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.businessLink} ${styles.googleMaps}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdClick(ad.id);
                    }}
                  >
                    <MapPin size={14} />
                    <span>Maps</span>
                  </a>
                )}
              </div>
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
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddBubble;
