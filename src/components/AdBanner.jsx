import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import '../styles/components/AdBanner.css';

const ADS = [
  {
    tag: 'INFO',
    text: '¡Otras Rutas de Bus Externo!',
    link: 'https://bus-ucr-coronado.netlify.app/',
    linkText: 'AQUÍ'
  },
  {
    tag: 'INFO',
    text: 'Nueva ruta Alajuela - UCR disponible.',
    link: '/external-stops/alajuela',
    linkText: 'Ver Info'
  },
  {
    tag: 'INFO',
    text: 'Visite a KodeCreative.',
    link: 'https://kobemg.com/',
    linkText: 'AQUÍ'
  }
];

const AdBanner = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  return (
    <div className="ad-banner glass-card embla" ref={emblaRef}>
      <div className="embla__container">
        {ADS.map((ad, index) => (
          <div className="embla__slide" key={index}>
            <div className="ad-content">
              <span className="ad-tag">{ad.tag}</span>
              <p className="ad-text">
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
