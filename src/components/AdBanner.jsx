import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Info,
  ExternalLink,
  Bug,
  Sparkles,
  Heart,
  MessageCircle
} from 'lucide-react';
import styles from './AdBanner.module.css';

const ADS = [

  {
    type: 'info',
    tag: 'INFO',
    text: '¡Otras Rutas de Bus Externo!',
    link: 'https://bus-ucr-externo.netlify.app',
    linkText: 'Ver ahora',
    icon: <Info size={18} />
  },
  {
    type: 'entrepreneur',
    tag: 'TUTORÍAS',
    text: '¿Semestre difícil? Tutorías en KodeCreative.',
    link: 'https://kobemg.com/',
    linkText: 'Visítanos',
    icon: <Sparkles size={18} />
  },
  {
    type: 'bug',
    tag: 'ERROR',
    text: '¿Hay algún error? Repórtelo aquí.',
    link: 'mailto:buspronto@kobemg.com',
    linkText: 'Reportar',
    icon: <Bug size={18} />
  },
  {
    type: 'community',
    tag: 'COMUNIDAD',
    text: 'Buscamos un hogar para este gatito.',
    link: 'https://wa.me/50660091562?text=Hola,%20quisiera%20adoptar%20el%20gatito',
    linkText: 'Adoptar',
    icon: <Heart size={18} />
  },
  {
    type: 'info',
    tag: 'INFO',
    text: '¿Alguna Sugerencia? Contáctenos.',
    link: 'mailto:buspronto@kobemg.com',
    linkText: 'Contactanos',
    icon: <MessageCircle size={18} />
  }
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const AdBanner = () => {
  const shuffledAds = React.useMemo(() => shuffleArray(ADS), []);

  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ]);

  return (
    <div className={styles.adBanner} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {shuffledAds.map((ad, idx) => (
          <div className={styles.emblaSlide} key={`${ad.type}-${idx}`}>
            <div className={`${styles.adCard} ${styles[ad.type]}`}>
              <div className={styles.iconWrapper}>
                {ad.icon}
              </div>
              <div className={styles.adMainContent}>
                <div className={styles.adBody}>
                  <div className={styles.adHeader}>
                    <span className={styles.adTag}>{ad.tag}</span>
                  </div>
                  <p className={styles.adText}>{ad.text}</p>
                </div>
                {ad.link && (
                  <div className={styles.adFooter}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={ad.link}
                      className={styles.adLink}
                    >
                      {ad.linkText}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
