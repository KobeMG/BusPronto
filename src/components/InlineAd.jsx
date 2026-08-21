import { useMemo, useRef, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAdsQuery } from '../hooks/useAdsQuery';
import { getBubbleMessage, trackAdClick, trackAdImpression } from '../utils/adUtils';
import { getAdIcon } from '../utils/adThemeUtils';
import LogoOrIcon from './LogoOrIcon';
import styles from './InlineAd.module.css';

const InlineAd = () => {
  const { data: allAds = [] } = useAdsQuery();
  const ref = useRef(null);

  // Mayor prioridad entre los ads con mensaje
  const ad = useMemo(() => {
    const visible = allAds.filter((a) => getBubbleMessage(a) !== '');
    if (visible.length === 0) return null;
    return [...visible].sort((a, b) => (Number(b.priority) || 1) - (Number(a.priority) || 1))[0];
  }, [allAds]);

  // ponytail: impresión una vez por montaje cuando es visible; sin dedupe por sesión (cada vista real cuenta)
  useEffect(() => {
    if (!ad || !ref.current) return;
    const el = ref.current;
    let counted = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !counted) {
        counted = true;
        trackAdImpression(ad.id);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ad]);

  if (!ad) return null;

  return (
    <div ref={ref} className={styles.inlineAd}>
      <div className={styles.logoWrap}>
        <LogoOrIcon logo={ad.logo} fallbackIcon={getAdIcon(ad.type, 22)} title={ad.title} className={styles.logo} />
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{ad.title}</h4>
        <p className={styles.message}>{getBubbleMessage(ad)}</p>
        {ad.link && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAdClick(ad.id)}
            className={styles.cta}
          >
            {ad.link_text || 'Visitar'}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

export default InlineAd;
