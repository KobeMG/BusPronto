import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from './AdBanner.module.css';

const ADS = [
  {
    tag: 'INFO',
    text: '¡Otras Rutas de Bus Externo!',
    link: 'https://bus-ucr-externo.netlify.app',
    linkText: 'AQUÍ'
  },
  {
    tag: 'INFO',
    text: '¿Semestre Dificil? Damos tutorias en KodeCreative.',
    link: 'https://kobemg.com/',
    linkText: 'VISITENOS'
  },
  {
    tag: 'BUG',
    text: '¿Hay algún error? Repórtelo.',
    link: 'mailto:kobemoya@gmail.com',
    linkText: 'AQUÍ'
  }
];
// Aleatorizar el array de anuncios.
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const AdBanner = () => {
  const shuffledAds = React.useMemo(() => shuffleArray(ADS), []);

  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  return (
    <div className={`${styles.adBanner} glass-card ${styles.embla}`} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {shuffledAds.map((ad) => (
          <div className={styles.emblaSlide} key={ad.text}>
            <div className={styles.adContent}>
              <span className={styles.adTag}>{ad.tag}</span>
              <p className={styles.adText}>
                {ad.text} {ad.link && <a target="_blank" rel="noopener noreferrer" href={ad.link}>{ad.linkText}</a>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
