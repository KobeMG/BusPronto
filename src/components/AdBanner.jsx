import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Info,
  ExternalLink,
  Bug,
  Sparkles,
  Heart,
  MessageCircle,
  UtensilsCrossed
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from './AdBanner.module.css';

const ICON_MAP = {
  info: <Info size={18} />,
  entrepreneur: <Sparkles size={18} />,
  bug: <Bug size={18} />,
  community: <Heart size={18} />,
  suggestion: <MessageCircle size={18} />,
  restaurant: <UtensilsCrossed size={18} />
};

const shuffleArray = (array) => {

  return [...array].sort(() => Math.random() - 0.5);
};

const AdBanner = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ]);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedAds = data.map(ad => ({
          ...ad,
          icon: ICON_MAP[ad.type] || <Info size={18} />
        }));
        setAds(shuffleArray(formattedAds));
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (id) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: id });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
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
                  <p className={styles.adText}>{ad.description}</p>
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


