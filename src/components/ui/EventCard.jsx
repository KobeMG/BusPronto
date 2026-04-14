import { MapPin, Users, Video, Globe, ExternalLink, Clock } from 'lucide-react';
import { formatEventTime } from '../../utils/semanaUUtils';
import styles from './EventCard.module.css';


const EventCard = ({ event }) => {
  const { title, organizer, location, modality, is_active, google_maps, start_time } = event;
  const formattedTime = formatEventTime(start_time);


  // Determinar ícono y clase según la modalidad
  const getModalityConfig = (mod) => {
    switch (mod?.toLowerCase()) {
      case 'presencial':
        return { icon: <MapPin size={14} />, className: styles.presencial };
      case 'virtual':
        return { icon: <Video size={14} />, className: styles.virtual };
      case 'híbrido':
      case 'hibrido':
        return { icon: <Globe size={14} />, className: styles.hibrido };
      default:
        return { icon: <MapPin size={14} />, className: styles.presencial };
    }
  };

  const { icon, className } = getModalityConfig(modality);

  return (
    <div className={`${styles.card} ${!is_active ? styles.cancelled : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={`${styles.badge} ${className}`}>
          {modality || 'Evento'}
        </span>
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
