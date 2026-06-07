import { MapPin, Video, Globe, ExternalLink, Clock, Share2 } from 'lucide-react';
import { sileo } from 'sileo';
import { formatEventTime, formatDateRange, shareEvent, getEventModalityConfig } from '../../utils/eventosUtils';
import styles from './EventCard.module.css';

const MODALITY_ICONS = {
  presencial: <MapPin size={14} />,
  virtual: <Video size={14} />,
  hibrido: <Globe size={14} />,
};

const EventCard = ({ event, isHighlighted }) => {
  const { title, organizer, location, modality, is_active, google_maps, registration_link, start_time, event_date_start, event_date_finish } = event;
  const formattedTime = formatEventTime(start_time);
  const dateRange = formatDateRange(event_date_start, event_date_finish);

  const { type, className } = getEventModalityConfig(modality, styles);
  const icon = MODALITY_ICONS[type] || MODALITY_ICONS.presencial;

  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await shareEvent(event, formattedTime);
    if (result.success && result.method === 'clipboard') {
      sileo.success({
        title: '¡Evento Copiado!',
        description: 'La información se copió correctamente.',
        position: 'top-center',
        duration: 2500
      });
    }
  };

  return (
    <div 
      id={`event-card-${event.id}`}
      className={`${styles.card} ${!is_active ? styles.cancelled : ''} ${isHighlighted ? styles.highlighted : ''}`}
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

    </div>
  );
};

export default EventCard;
