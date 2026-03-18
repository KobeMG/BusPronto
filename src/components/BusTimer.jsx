import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const BusTimer = ({ schedule }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const parseTimeToDate = (timeStr, referenceDate) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(referenceDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  useEffect(() => { // Actualiza la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update tab title with countdown
  useEffect(() => {
    const { nextBus, secondsRemaining } = getNextBus();
    if (nextBus && secondsRemaining !== null) {
      const mins = Math.ceil(secondsRemaining / 60);
      document.title = `${mins}m | BusPronto`;
    } else {
      document.title = 'BusPronto';
    }
    return () => {
      document.title = 'BusPronto';
    };
  }, [currentTime]);

  const getNextBus = () => {
    const now = currentTime;

    let nextBus = null;
    let minDiffSeconds = Infinity;

    for (const timeStr of schedule) {
      const busDate = parseTimeToDate(timeStr, now);
      const diffSeconds = Math.floor((busDate.getTime() - now.getTime()) / 1000);

      if (diffSeconds >= 0 && diffSeconds < minDiffSeconds) {
        minDiffSeconds = diffSeconds;
        nextBus = timeStr;
      }
    }

    return {
      nextBus,
      secondsRemaining: minDiffSeconds === Infinity ? null : minDiffSeconds,
    };
  };

  const getLastBus = () => {
    const now = currentTime;
    let lastBus = null;
    let maxDiffSeconds = -Infinity;

    for (const timeStr of schedule) {
      const busDate = parseTimeToDate(timeStr, now);
      const diffSeconds = Math.floor((busDate.getTime() - now.getTime()) / 1000);

      // Buscar el bus más próximo pero en el pasado (diff < 0)
      if (diffSeconds < 0 && diffSeconds > maxDiffSeconds) {
        maxDiffSeconds = diffSeconds;
        lastBus = timeStr;
      }
    }

    return lastBus;
  };

  const { nextBus, secondsRemaining } = getNextBus();
  const lastBus = getLastBus();

  // Get upcoming buses (next 3)
  const getUpcomingBuses = () => {
    if (!nextBus) return [];

    const nextIndex = schedule.indexOf(nextBus);
    return schedule.slice(nextIndex, nextIndex + 4);
  };

  const upcomingBuses = getUpcomingBuses();

  if (!nextBus) {
    return (
      <div className="no-more-buses">
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
      <div className="timer-section">
        <div className="time-remaining">{timeString}</div>
        <div className="time-label">para el próximo bus</div>
      </div>

      <div className="next-bus-details">
        <div className="detail-item">
          <span className="detail-label">Hora actual</span>
          <span className="detail-value">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {lastBus && (
          <div className="detail-item">
            <span className="detail-label">Bus anterior</span>
            <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} /> {lastBus}
            </span>
          </div>
        )}
        <div className="detail-item" style={{ alignItems: 'flex-end' }}>
          <span className="detail-label">Siguiente bus</span>
          <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> {nextBus}
          </span>
        </div>
      </div>

      <div className="schedule-list">
        <h3 className="schedule-title">Próximos horarios:</h3>
        <div className="times-grid">
          {upcomingBuses.map((time, idx) => (
            <div key={time} className={`time-badge ${idx === 0 ? 'next' : ''}`}>
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusTimer;
