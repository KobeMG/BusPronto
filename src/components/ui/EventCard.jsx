import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Video, Globe, ExternalLink, Clock, Share2, X } from 'lucide-react';
import { formatEventTime, formatDateRange, shareEvent } from '../../utils/eventosUtils';
import styles from './EventCard.module.css';

const MODALITY_ICONS = {
  presencial: <MapPin size={14} />,
  virtual: <Video size={14} />,
  hibrido: <Globe size={14} />,
};

const getModalityConfig = (modality) => {
  switch (modality?.toLowerCase()) {
    case 'presencial':
      return { type: 'presencial', className: styles.presencial };
    case 'virtual':
      return { type: 'virtual', className: styles.virtual };
    case 'híbrido':
    case 'hibrido':
      return { type: 'hibrido', className: styles.hibrido };
    default:
      return { type: 'presencial', className: styles.presencial };
  }
};

const EventCard = ({ event, isHighlighted }) => {
  const { title, description, organizer, location, modality, is_active, google_maps, registration_link, start_time, event_date_start, event_date_finish } = event;
  const formattedTime = formatEventTime(start_time);
  const dateRange = formatDateRange(event_date_start, event_date_finish);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { type, className } = getModalityConfig(modality);
  const icon = MODALITY_ICONS[type] || MODALITY_ICONS.presencial;

  const hasDetail = Boolean(description);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!isDetailOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isDetailOpen]);

  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await shareEvent(event, formattedTime);
  };

  const handleCardClick = () => {
    if (hasDetail) setIsDetailOpen(true);
  };

  return (
    <>
      <div
        id={`event-card-${event.id}`}
        className={`${styles.card} ${!is_active ? styles.cancelled : ''} ${isHighlighted ? styles.highlighted : ''} ${hasDetail ? styles.clickable : ''}`}
        onClick={handleCardClick}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.headerRight}>
            <span className={`${styles.badge} ${className}`}>
              {modality || 'Evento'}
            </span>
            <button
              className={styles.shareButton}
              onClick={handleShare}
              aria-label="Compartir evento"
              title="Compartir evento"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        <div className={styles.organizer}>
          {organizer || 'Organización UCR'}
        </div>

        {dateRange && (
          <div className={styles.infoRow}>
            <div className={styles.icon}><Clock size={14} /></div>
            <span className={styles.locationText}>{dateRange}</span>
          </div>
        )}

        <div className={styles.infoRow}>
          <div className={styles.icon}>{icon}</div>
          <span className={styles.locationText}>{location || 'Lugar por definir'}</span>
        </div>


        {formattedTime && (
          <div className={styles.infoRow}>
            <div className={styles.icon}><Clock size={14} /></div>
            <span className={styles.locationText}>Desde las {formattedTime}</span>
          </div>
        )}

        {google_maps && (
          <div className={styles.infoRow}>
            <div className={styles.icon}><ExternalLink size={14} /></div>
            <a
              href={google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapsLink}
              title="Ver en Google Maps"
              onClick={(e) => e.stopPropagation()}
            >
              Abrir ubicación
            </a>
          </div>
        )}

        {registration_link && (
          <div className={styles.infoRow}>
            <div className={styles.icon}><ExternalLink size={14} /></div>
            <a
              href={registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.regLink}
              title="Inscripción al evento"
              onClick={(e) => e.stopPropagation()}
            >
              Inscribirse
            </a>
          </div>
        )}

        {hasDetail && (
          <div className={styles.detailHint}>Toque para ver más detalles</div>
        )}
      </div>

      {/* Modal de detalle — renderizado en body para evitar containing blocks */}
      {isDetailOpen && createPortal(
        <div className={styles.detailOverlay} onClick={() => setIsDetailOpen(false)} id={`event-detail-overlay-${event.id}`}>
          <div
            className={styles.detailModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`event-detail-title-${event.id}`}
          >
            <div className={styles.detailHeader}>
              <div>
                <h2 id={`event-detail-title-${event.id}`} className={styles.detailTitle}>{title}</h2>
                <div className={styles.detailOrganizer}>{organizer || 'Organización UCR'}</div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className={styles.detailClose}
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.detailContent}>
              <p className={styles.detailDescription}>{description}</p>

              <div className={styles.detailMeta}>
                {dateRange && (
                  <div className={styles.detailMetaRow}>
                    <Clock size={15} />
                    <span>{dateRange}</span>
                  </div>
                )}
                {formattedTime && (
                  <div className={styles.detailMetaRow}>
                    <Clock size={15} />
                    <span>Desde las {formattedTime}</span>
                  </div>
                )}
                <div className={styles.detailMetaRow}>
                  {icon}
                  <span>{location || 'Lugar por definir'}</span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={`${styles.badge} ${className}`}>{modality || 'Evento'}</span>
                </div>
              </div>

              {(google_maps || registration_link) && (
                <div className={styles.detailActions}>
                  {google_maps && (
                    <a href={google_maps} target="_blank" rel="noopener noreferrer" className={styles.detailActionBtn}>
                      <MapPin size={15} /> Ver ubicación
                    </a>
                  )}
                  {registration_link && (
                    <a href={registration_link} target="_blank" rel="noopener noreferrer" className={styles.detailActionBtnReg}>
                      <ExternalLink size={15} /> Inscribirse
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EventCard;
