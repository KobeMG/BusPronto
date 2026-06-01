import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { X } from 'lucide-react';
import styles from './ImageCarousel.module.css';

const Lightbox = ({ images, title, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const handlePrev = useCallback((e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback((e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, handlePrev, handleNext]);

  return createPortal(
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.lightboxClose}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <img
          src={images[index]}
          alt={`${title} - vista ${index + 1}`}
          className={styles.lightboxImage}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.lightboxBtn} ${styles.lightboxPrev}`}
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.lightboxBtn} ${styles.lightboxNext}`}
              onClick={handleNext}
              aria-label="Siguiente imagen"
            >
              ›
            </button>

            <div className={styles.lightboxCounter}>
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

const ImageCarousel = ({ images, title, className }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleImageClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setLightboxOpen(true);
  };

  if (!images || !Array.isArray(images) || images.length === 0) return null;

  return (
    <>
      <div
        className={`${styles.embla} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {images.map((src, idx) => (
              <div className={styles.emblaSlide} key={idx}>
                <img
                  src={src}
                  alt={`${title} - vista ${idx + 1}`}
                  className={styles.carouselImage}
                  onClick={handleImageClick}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.carouselBtn} ${styles.prev}`}
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.carouselBtn} ${styles.next}`}
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Siguiente imagen"
            >
              ›
            </button>

            <div className={styles.carouselDots}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.carouselDot} ${idx === selectedIndex ? styles.activeDot : ''}`}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          title={title}
          startIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default ImageCarousel;
