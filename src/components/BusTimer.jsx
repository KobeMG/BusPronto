import { useState, useEffect } from 'react';
import styles from './BusTimer.module.css';
import { Clock } from 'lucide-react';
import { calculateBuses, getUpcomingBusesList } from '../utils/timeHelpers';

const BusTimer = ({ schedule }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { // Actualiza la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { nextBus, secondsRemaining, lastBus } = calculateBuses(schedule, currentTime);

  // Update tab title with countdown
  useEffect(() => {
    if (nextBus && secondsRemaining !== null) {
      const mins = Math.ceil(secondsRemaining / 60);
      document.title = `${mins}m | BusPronto`;
    } else {
      document.title = 'BusPronto';
    }
    return () => {
      document.title = 'BusPronto';
    };
  }, [currentTime, nextBus, secondsRemaining]);

  const upcomingBuses = getUpcomingBusesList(schedule, nextBus);

  if (!nextBus) {
    return (
      <div className={styles.noMoreBuses}>
        No hay más buses programados para hoy en esta parada.
      </div>
    );
  }

  const hoursRemaining = Math.floor(secondsRemaining / 3600);
  const displayMinutes = Math.floor((secondsRemaining % 3600) / 60);
  const displaySeconds = secondsRemaining % 60;

  let timeString = '';
  if (hoursRemaining > 0) timeString += `${hoursRemaining}h `;
  timeString += `${displayMinutes}m ${displaySeconds}s`;

  return (
    <div>
      <div className={styles.timerSection}>
        <div className={styles.timeRemaining}>{timeString}</div>
        <div className={styles.timeLabel}>para el próximo bus</div>
      </div>

      <div className={`${styles.nextBusDetails} ${!lastBus ? styles.twoCols : ''}`}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Hora actual</span>
          <div className={styles.detailValue}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>
        {lastBus && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Bus anterior</span>
            <div className={styles.detailValue}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> {typeof lastBus === 'string' ? lastBus : lastBus.time}
              </span>
            </div>
            {typeof lastBus !== 'string' && lastBus.destination && (
              <span className={styles.detailDestination}>
                Hacia {lastBus.destination}
              </span>
            )}
          </div>
        )}
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Siguiente bus</span>
          <div className={styles.detailValue}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> {typeof nextBus === 'string' ? nextBus : nextBus.time}
            </span>
          </div>
          {typeof nextBus !== 'string' && nextBus.destination && (
            <span className={styles.detailDestination}>
              Hacia {nextBus.destination}
            </span>
          )}
        </div>
      </div>

      <div className={styles.scheduleList}>
        <h3 className={styles.scheduleTitle}>Próximos horarios:</h3>
        <div className={styles.timesGrid}>
          {upcomingBuses.map((bus, idx) => {
            const time = typeof bus === 'string' ? bus : bus.time;
            const dest = typeof bus === 'string' ? null : bus.destination;
            return (
              <div key={`${time}-${idx}`} className={`${styles.timeBadge} ${idx === 0 ? styles.next : ''}`}>
                <span className={styles.timeBadgeValue}>{time}</span>
                {dest && (
                  <span className={styles.timeBadgeDest}>
                    {dest}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusTimer;
