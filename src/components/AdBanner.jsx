import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from './AdBanner.module.css';

const ADS = [
  {
    tag: 'INFO',
    text: '¡Otras Rutas de Bus Externo!',
    link: 'https://bus-ucr-coronado.netlify.app/',
    linkText: 'AQUÍ'
  },
  {
    tag: 'INFO',
    text: 'Nueva rutas externas disponibles.',
    link: '',
    linkText: 'Ver Info'
  },
  {
    tag: 'INFO',
    text: 'Visite a KodeCreative.',
    link: 'https://kobemg.com/',
    linkText: 'AQUÍ'
  },
  {
    tag: 'BUG',
    text: 'Hay algún error? Repórtelo.',
    link: 'mailto:kobemoya@gmail.com',
    linkText: 'AQUÍ'
  }
];

const AdBanner = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  return (
    <div className={`${styles.adBanner} glass-card ${styles.embla}`} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {ADS.map((ad, index) => (
          <div className={styles.emblaSlide} key={index}>
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
