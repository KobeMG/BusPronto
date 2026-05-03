import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Info, Sparkles, UtensilsCrossed, Store } from 'lucide-react';
import { fetchRandomAdData, trackAdClick, calculateSnapX, getAppBounds } from '../utils/addBubbleUtils';
import styles from './AddBubble.module.css';

const AD_THEMES = {
  restaurant: {
    icon: <UtensilsCrossed size={24} />,
    color: 'var(--ad-restaurant-start)',
    gradient: 'linear-gradient(135deg, var(--ad-restaurant-start) 0%, var(--ad-restaurant-end) 100%)',
  },
  entrepreneur: {
    icon: <Sparkles size={24} />,
    color: 'var(--ad-entrepreneur-start)',
    gradient: 'linear-gradient(135deg, var(--ad-entrepreneur-start) 0%, var(--ad-entrepreneur-end) 100%)',
  },
  store: {
    icon: <Store size={24} />,
    color: 'var(--ad-store-start)',
    gradient: 'linear-gradient(135deg, var(--ad-store-start) 0%, var(--ad-store-end) 100%)',
  },
  default: {
    icon: <Info size={24} />,
    color: 'var(--ad-default-start)',
    gradient: 'linear-gradient(135deg, var(--ad-default-start) 0%, var(--ad-default-end) 100%)',
  }
};

const AddBubble = () => {
  const [ad, setAd] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isRightSide, setIsRightSide] = useState(true);

  const controls = useAnimation();
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
    const initAd = async () => {
      const { ad: randomAd, phrase: randomPhrase } = await fetchRandomAdData();
      if (randomAd) {
        setAd(randomAd);
        setPhrase(randomPhrase);
      }
    };
    initAd();
  }, []);

  // Efecto para manejar la posición inicial, el centrado al abrir y el snap al cerrar
  useEffect(() => {
    // Si no hay ad o el ancho es 0, el componente no se renderiza, no hacemos nada
    if (!ad || windowDimensions.width === 0) return;

    if (isOpen) {
      // Centramos la tarjeta (ancho de 280px definido en CSS)
      const { appLeft, appWidth } = getAppBounds(windowDimensions.width);
      controls.start({
        x: appLeft + (appWidth / 2) - 140,
        y: (windowDimensions.height / 2) - 150,
        transition: { type: 'spring', stiffness: 200, damping: 25 }
      });
    } else {
      // Al cerrar o al INICIAR, lo mandamos al borde.
      // Usamos setTimeout para que se ejecute justo después del primer render (montaje del DOM)
      const timer = setTimeout(() => {
        const { appRight } = getAppBounds(windowDimensions.width);
        const currentX = typeof controls.get === 'function' ? controls.get().x : appRight - 70;
        const snapX = calculateSnapX(currentX || appRight - 70, windowDimensions.width);

        controls.start({
          x: snapX,
          y: windowDimensions.height / 2, // ¡Muy importante para que no se quede en y: -100!
          transition: { type: 'spring', stiffness: 200, damping: 25 }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [ad, isOpen, windowDimensions.width, windowDimensions.height, controls]);



  // Efecto para ocultar el globo de texto automáticamente después de 1 segundos. No molestar al usuario bro
  useEffect(() => {
    if (showTooltip && ad) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 1000);
      return () => clearTimeout(tooltipTimer);
    }
  }, [showTooltip, ad]);

  const handleDragEnd = (e, info) => {
    const snapX = calculateSnapX(info.point.x, windowDimensions.width);
    const { appLeft, appRight } = getAppBounds(windowDimensions.width);
    const appCenter = appLeft + (appRight - appLeft) / 2;
    setIsRightSide(snapX > appCenter);

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

  return (
    <motion.div
      className={styles.container}
      drag
      dragConstraints={{
        left: bounds.appLeft + 10,
        right: bounds.appRight - 70,
        top: 10,
        bottom: windowDimensions.height - 70
      }}
      dragMomentum={false}
      onDragStart={() => setShowTooltip(false)}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ x: -100, y: -100 }}
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
          {theme.icon}
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
              {theme.icon}
            </div>
            <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.cardBody}>
            <h4 className={styles.adTitle}>{ad.title}</h4>
            <p className={styles.adDesc}>{ad.description}</p>
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
