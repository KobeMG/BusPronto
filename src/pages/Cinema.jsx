import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { sileo } from 'sileo';
import { MapPin, Video, Calendar, Clock, Film, Share2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CinemaCarousel from '../components/CinemaCarousel';
import { useCinemaQuery } from '../hooks/useCinemaQuery';
import { shareMovie } from '../utils/cinemaUtils';
import styles from './Cinema.module.css';
import { formatDate, formatTime } from '../utils/dateHelpers';

const Cinema = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: movies = [], isLoading: loading, error } = useCinemaQuery();

  const activeMovie = movies[activeIndex];

  const handleShare = async (e) => {
    if (!activeMovie) return;
    e.stopPropagation();
    
    const formattedDate = formatDate(activeMovie.screening_date);
    const formattedTime = formatTime(activeMovie.screening_time);
    
    const result = await shareMovie(activeMovie, formattedDate, formattedTime);
    if (result.success && result.method === 'clipboard') {
      sileo.success({
        title: '¡Copiado!',
        description: 'Información de la película copiada al portapapeles.',
        position: 'top-center',
        duration: 2500
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Cine Universitario - BusPronto</title>
        <meta name="description" content="Descubre las funciones del Cine Universitario. Películas presenciales y por Zoom." />
        <link rel="canonical" href="https://www.buspronto.lat/cine" />
        <meta property="og:title" content="Cine Universitario - BusPronto" />
        <meta property="og:description" content="Consulta la cartelera del Cine Universitario. Películas presenciales y virtuales." />
        <meta property="og:url" content="https://www.buspronto.lat/cine" />
        <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
      </Helmet>

      <div className="glass-card">
        <PageHeader
          title="Cine Universitario"
          description="Deslice para ver la cartelera del mes"
          showBackButton={true}
          backUrl="/"
        />

        {loading ? (
          <div style={{ padding: '3rem 0' }}>
            <LoadingSpinner message="Cargando cartelera..." />
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="info-message">
            No hay películas programadas en este momento.
          </div>
        ) : (
          <div className={styles.cinemaLayout}>
            {/* Carousel Section */}
            <div className={styles.carouselSection}>
              <CinemaCarousel
                movies={movies}
                onSelectIndex={setActiveIndex}
              />
            </div>

            {/* Details Section */}
            <div className={styles.detailsSection}>
              {activeMovie && (
                <div className={styles.movieDetailsCard}>
                  <div className={styles.movieHeader}>
                    <div className={styles.titleRow}>
                      <h2 className={styles.movieTitle}>{activeMovie.title}</h2>
                      <button 
                        className={styles.shareButton} 
                        onClick={handleShare}
                        title="Compartir película"
                        aria-label="Compartir película"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                    {activeMovie.synopsis && (
                      <p className={styles.movieSynopsis}>{activeMovie.synopsis}</p>
                    )}
                  </div>

                  <div className={styles.movieInfoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.iconWrapper}>
                        <Calendar size={20} />
                      </div>
                      <div className={styles.infoText}>
                        <span className={styles.infoLabel}>Fecha</span>
                        <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                          {formatDate(activeMovie.screening_date)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <div className={styles.iconWrapper}>
                        <Clock size={20} />
                      </div>
                      <div className={styles.infoText}>
                        <span className={styles.infoLabel}>Hora</span>
                        <span className={styles.infoValue}>
                          {formatTime(activeMovie.screening_time)}
                        </span>
                      </div>
                    </div>

                    <div className={`${styles.infoItem} ${activeMovie.virtual ? styles.virtualMode : styles.presencialMode}`}>
                      <div className={styles.iconWrapper}>
                        {activeMovie.virtual ? <Video size={20} /> : <MapPin size={20} />}
                      </div>
                      <div className={styles.infoText}>
                        <span className={styles.infoLabel}>
                          {activeMovie.virtual ? 'Vía Zoom' : 'Presencial'}
                        </span>
                        <span className={styles.infoValue}>
                          {activeMovie.location_name}
                        </span>
                        {activeMovie.location_details && (
                          <span className={styles.extraDetails}>
                            {activeMovie.location_details.includes('http') ? (
                              <a href={activeMovie.location_details} target="_blank" rel="noopener noreferrer">
                                {activeMovie.virtual ? 'Enlace de la reunión' : 'Ver Mapa'}
                              </a>
                            ) : (
                              activeMovie.location_details
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cinema;
