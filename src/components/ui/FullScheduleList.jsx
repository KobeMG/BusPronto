import React from 'react';
import styles from './FullScheduleList.module.css';
import { Clock, ChevronUp } from 'lucide-react';

const FullScheduleList = ({ schedule, nextBusTime }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className={styles.empty}>
        No hay horarios registrados para este día.
      </div>
    );
  }

  // Grupar por hora (ej. 06:XX, 07:XX)
  const grouped = schedule.reduce((acc, item) => {
    const hour = item.time.split(':')[0];
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(item);
    return acc;
  }, {});

  const sortedHours = Object.keys(grouped).sort();

  return (
    <div className={styles.container}>
      {sortedHours.map(hour => (
        <div key={hour} className={styles.hourGroup}>
          <div className={styles.hourLabel}>{hour}:00 hrs</div>
          <div className={styles.itemsGrid}>
            {grouped[hour].map((item, idx) => {
              const isNext = nextBusTime === item.time;
              return (
                <div
                  key={`${item.time}-${idx}`}
                  className={`${styles.scheduleItem} ${isNext ? styles.nextBus : ''}`}
                >
                  <div className={styles.timeWrap}>
                    <Clock size={16} className={isNext ? styles.nextIcon : styles.icon} />
                    <span className={styles.time}>{item.time}</span>
                    {isNext && <span className={styles.nextBadge}>Siguiente</span>}
                  </div>
                  {item.destination && (
                    <div className={styles.destWrap}>
                      <span>{item.destination}</span>
                    </div>
                  )}

                </div>

              );
            })}
          </div>
        </div>
      ))}
      <button
        className={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver al inicio"
      >
        <ChevronUp size={18} />
        <span>Subir</span>
      </button>
    </div>
  );
};

export default FullScheduleList;
