import React, { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ExternalLink } from 'lucide-react';
import { trackAdClick, shuffleArray } from '../utils/adBannerUtils';
import { getAdIcon } from '../utils/adThemeUtils';
import { useAdsQuery } from '../hooks/useAdsQuery';
import styles from './AdBanner.module.css';

const AdBanner = () => {
  const { data: adsRaw = [], isLoading: loading } = useAdsQuery();
  
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ]);

  const ads = useMemo(() => {
    if (!adsRaw || adsRaw.length === 0) return [];
    
    const filtered = adsRaw.filter(ad => ad.addBannerMessage && ad.addBannerMessage.trim() !== '');
    
    const formatted = filtered.map(ad => ({
      ...ad,
      icon: getAdIcon(ad.type, 18)
    }));
    
    return shuffleArray(formatted);
  }, [adsRaw]);

  const handleAdClick = (id) => {
    trackAdClick(id);
  };

  if (loading) {
    return (
      <div className={styles.adBanner}>
        <div className={styles.adCard}>
          <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
          <div className={styles.adMainContent}>
            <div className={styles.adBody}>
              <div className={`${styles.skeleton} ${styles.skeletonTag}`} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
              <div className={`${styles.skeleton} ${styles.skeletonTextSub}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className={styles.adBanner} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {ads.map((ad, idx) => (
          <div className={styles.emblaSlide} key={ad.id || idx}>
            <div className={`${styles.adCard} ${styles[ad.type]}`}>
              <div className={styles.iconWrapper}>
                {ad.icon}
              </div>
              <div className={styles.adMainContent}>
                <div className={styles.adBody}>
                  <div className={styles.adHeader}>
                    <span className={styles.adTag}>{ad.title}</span>
                  </div>
                  <p className={styles.adText}>{ad.addBannerMessage}</p>
                </div>
                {ad.link && (
                  <div className={styles.adFooter}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={ad.link}
                      onClick={() => handleAdClick(ad.id)}
                      className={styles.adLink}
                    >
                      {ad.link_text}
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


