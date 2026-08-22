import React, { useState } from 'react';
import styles from './FullScheduleList.module.css';
import { Clock, ChevronUp } from 'lucide-react';
import { parseTimeToDate, formatRemaining } from '../../utils/timeHelpers';

const FullScheduleList = ({ schedule, nextBusTime, isTodayView }) => {
  const [selectedKey, setSelectedKey] = useState(null);

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
              // Identidad hora+destino: sobrevive reordenamientos y evita
              // que horarios con la misma hora se pisen entre sí.
              const itemKey = `${item.time}|${item.destination || ''}`;
              const isSelected = selectedKey === itemKey;

              let timeLabel = null;
              if (isSelected) {
                // Cálculo estático al click: sin ticker, el label no se actualiza solo.
                const busDate = parseTimeToDate(item.time, new Date());
                const diffSeconds = Math.floor((busDate.getTime() - Date.now()) / 1000);
                timeLabel = formatRemaining(diffSeconds);
              }

              const itemClass = `${styles.scheduleItem} ${isNext ? styles.nextBus : ''} ${isSelected ? styles.selected : ''}`;

              const content = (
                <>
                  <div className={styles.timeWrap}>
                    <Clock size={16} className={isNext ? styles.nextIcon : styles.icon} />
                    <span className={styles.time}>{item.time}</span>
                    {isNext && <span className={styles.nextBadge}>Siguiente</span>}
                    {timeLabel && (
                      <span className={styles.remainingLabel}>{timeLabel}</span>
                    )}
                  </div>
                  {item.destination && (
                    <div className={styles.destWrap}>
                      <span>{'Rumbo a: ' + item.destination}</span>
                    </div>
                  )}
                </>
              );

              if (!isTodayView) {
                return (
                  <div key={`${item.time}-${idx}`} className={itemClass}>
                    {content}
                  </div>
                );
              }

              return (
                <button
                  key={`${item.time}-${idx}`}
                  type="button"
                  className={itemClass}
                  onClick={() => setSelectedKey(isSelected ? null : itemKey)}
                  aria-pressed={isSelected}
                >
                  {content}
                </button>
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
