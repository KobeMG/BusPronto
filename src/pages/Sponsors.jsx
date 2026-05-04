import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Mail, MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { trackAdClick } from '../utils/adBannerUtils';
import { getAdIcon } from '../utils/adThemeUtils';
import { useAdsQuery } from '../hooks/useAdsQuery';
import styles from './Sponsors.module.css';

const Sponsors = () => {
  const { data: adsRaw = [], isLoading: loading } = useAdsQuery();

  const ads = useMemo(() => {
    return (adsRaw || []).filter(
      ad => ad.description && ad.description.trim() !== ''
    );
  }, [adsRaw]);

  const handleAdClick = (id) => {
    trackAdClick(id);
  };

  return (
    <>
      <Helmet>
        <title>Nuestros Aliados - BusPronto</title>
        <meta name="description" content="Conoce a los patrocinadores y aliados que hacen posible BusPronto." />
        <link rel="canonical" href="https://www.buspronto.lat/aliados" />
      </Helmet>

      <div className="glass-card">
        <PageHeader
          title="Nuestros Aliados"

          description="Empresas y proyectos que ayudan a mantener BusPronto"
          showBackButton={true}
          backUrl="/"
        />

        {loading ? (
          <div className={styles.loaderContainer}>
            <LoadingSpinner message="Cargando aliados..." />
          </div>
        ) : ads.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay aliados registrados en este momento.</p>
          </div>
        ) : (
          <div className={styles.sponsorsGrid}>
            {ads.map((ad) => (
              <div
                key={ad.id}
                className={`${styles.sponsorCard} ${styles[ad.type] || styles.default}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    {getAdIcon(ad.type, 24)}
                  </div>
                  <h3 className={styles.sponsorTitle}>{ad.title}</h3>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.sponsorDesc}>
                    {ad.description}
                  </p>

                  {(ad.uber_eats || ad.google_maps || ad.whatsapp) && (
                    <div className={styles.businessLinks}>
                      {ad.whatsapp && (
                        <a
                          href={`https://wa.me/${ad.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.businessLink} ${styles.whatsapp}`}
                          title="Contactar por WhatsApp"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdClick(ad.id);
                          }}
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {ad.uber_eats && (
                        <a
                          href={ad.uber_eats}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.businessLink} ${styles.uberEats}`}
                          title="Pedir por Uber Eats"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdClick(ad.id);
                          }}
                        >
                          <ShoppingBag size={14} />
                          <span>Uber Eats</span>
                        </a>
                      )}
                      {ad.google_maps && (
                        <a
                          href={ad.google_maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.businessLink} ${styles.googleMaps}`}
                          title="Ver en Google Maps"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdClick(ad.id);
                          }}
                        >
                          <MapPin size={14} />
                          <span>Maps</span>
                        </a>
                      )}
                    </div>
                  )}
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
                      {ad.link_text || 'Ver más'}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className={styles.contactSection}>
          <h3 className={styles.contactTitle}>¿Quiere ser parte de nuestros aliados?</h3>
          <a
            href="mailto:buspronto@kobemg.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactBtn}
          >
            <Mail size={20} />
            Contactar
          </a>
        </section>
      </div>
    </>
  );
};

export default Sponsors;
