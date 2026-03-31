/**
 * Funciones puras para el cálculo de horarios de buses.
 */

// Convierte un string "HH:mm" a un objeto Date de hoy
export const parseTimeToDate = (timeStr, referenceDate) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(referenceDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  // Dado un schedule (ej: [{ time: "06:30", destination: "..." }]) y la fecha actual, determina el próximo y el anterior bus
  export const calculateBuses = (schedule, currentTime) => {
    let nextBus = null;
    let minDiffSeconds = Infinity;
    
    let lastBus = null;
    let maxDiffSeconds = -Infinity;
  
    for (const item of schedule) {
      const timeStr = typeof item === 'string' ? item : item.time;
      if (!timeStr) continue;

      const busDate = parseTimeToDate(timeStr, currentTime);
      const diffSeconds = Math.floor((busDate.getTime() - currentTime.getTime()) / 1000);
      
      // Lógica NextBus (diff >= 0)
      if (diffSeconds >= 0 && diffSeconds < minDiffSeconds) {
        minDiffSeconds = diffSeconds;
        nextBus = item;
      }
  
      // Lógica LastBus (diff < 0)
      if (diffSeconds < 0 && diffSeconds > maxDiffSeconds) {
        maxDiffSeconds = diffSeconds;
        lastBus = item;
      }
    }
  
    return {
      nextBus,
      secondsRemaining: minDiffSeconds === Infinity ? null : minDiffSeconds,
      lastBus
    };
  };
  
  export const getUpcomingBusesList = (schedule, nextBus, count = 4) => {
    if (!nextBus || !schedule || schedule.length === 0) return [];
    
    const nextTime = typeof nextBus === 'string' ? nextBus : nextBus.time;
    
    const nextIndex = schedule.findIndex(item => {
        const itemTime = typeof item === 'string' ? item : item.time;
        return itemTime === nextTime;
    });

    if (nextIndex === -1) return [];
    
    return schedule.slice(nextIndex, nextIndex + count);
  };
  
