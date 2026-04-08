import React from 'react';
import { MapPin, Users, Video, Globe, ExternalLink } from 'lucide-react';
import styles from './EventCard.module.css';

const EventCard = ({ event }) => {
  const { title, organizer, location, modality, is_active, google_maps } = event;

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
        
        {google_maps && (
          <a 
            href={google_maps} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.mapsLink}
            title="Ver en Google Maps"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

export default EventCard;
