import { MapPin, Video, Globe, ExternalLink, Clock, Share2 } from 'lucide-react';
import { sileo } from 'sileo';
import { formatEventTime, shareEvent, getEventModalityConfig } from '../../utils/semanaUUtils';
import styles from './EventCard.module.css';

const MODALITY_ICONS = {
  presencial: <MapPin size={14} />,
  virtual: <Video size={14} />,
  hibrido: <Globe size={14} />,
};

const EventCard = ({ event }) => {
  const { title, organizer, location, modality, is_active, google_maps, start_time } = event;
  const formattedTime = formatEventTime(start_time);

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
    <div className={`${styles.card} ${!is_active ? styles.cancelled : ''}`}>
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
      <div className={styles.infoRow}>
        <div className={styles.icon}>{icon}</div>
        <span className={styles.locationText}>{location || 'Lugar por definir'}</span>
      </div>


      {formattedTime && (
        <div className={styles.infoRow}>
          <div className={styles.icon}><Clock size={14} /></div>
          <span className={styles.locationText}>{formattedTime}</span>
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

    </div>
  );
};

export default EventCard;
