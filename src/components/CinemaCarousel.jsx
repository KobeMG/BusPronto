import React, { useCallback, useSyncExternalStore } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './CinemaCarousel.module.css';

const CinemaCarousel = ({ movies, onSelectIndex }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  // ponytail: useSyncExternalStore evita un efecto que llame setState;
  // onSelectIndex se dispara en eventos reales de Embla (select/reInit)
  const subscribe = useCallback(
    (cb) => {
      if (!emblaApi) return () => {};
      const onSelect = () => {
        cb();
        onSelectIndex(emblaApi.selectedScrollSnap());
      };
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      };
    },
    [emblaApi, onSelectIndex],
  );

  const selectedIndex = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.selectedScrollSnap() : 0),
    () => 0,
  );

  if (!movies || movies.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {movies.map((movie, index) => {
            const isActive = index === selectedIndex;
            return (
              <div 
                className={`${styles.emblaSlide} ${isActive ? styles.isActive : ''}`} 
                key={movie.id || index}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
              >
                <div className={styles.posterWrapper}>
                  {movie.poster_url ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className={styles.posterImage}
                      loading="lazy"
                      width="400"
                      height="600"
                    />
                  ) : (
                    <div className={styles.posterFallback}>
                      {movie.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CinemaCarousel;
