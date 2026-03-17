import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const BusTimer = ({ schedule }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { // Actualiza la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getNextBus = () => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes(); // Convertir a minutos para facilitar el cálculo

    let nextBus = null;
    let minDiff = Infinity; // Al inicio se establece en infinito para que cualquier diferencia sea menor

    for (const timeStr of schedule) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const busMinutes = hours * 60 + minutes;

      const diff = busMinutes - currentMinutes;

      // If the bus is strictly in the future (or right now, diff >= 0)
      if (diff >= 0 && diff < minDiff) {
        minDiff = diff - 1; // Restar 1 minuto para mostrar el tiempo restante correcto
        nextBus = timeStr;
      }
    }

    return { nextBus, minutesRemaining: minDiff === Infinity ? null : minDiff };
  };

  const { nextBus, minutesRemaining } = getNextBus();

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

  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const displayMinutes = minutesRemaining % 60;

  // Calculate seconds remaining within the current minute
  const secondsRemaining = 59 - currentTime.getSeconds();

  let timeString = '';
  if (hoursRemaining > 0) timeString += `${hoursRemaining}h `;
  timeString += `${displayMinutes}m ${secondsRemaining}s`;

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
