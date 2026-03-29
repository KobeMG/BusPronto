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
  
  // Dado un schedule (ej: ["06:30", "07:00"]) y la fecha actual, determina el próximo y el anterior bus
  export const calculateBuses = (schedule, currentTime) => {
    let nextBus = null;
    let minDiffSeconds = Infinity;
    
    let lastBus = null;
    let maxDiffSeconds = -Infinity;
  
    for (const timeStr of schedule) {
      const busDate = parseTimeToDate(timeStr, currentTime);
      const diffSeconds = Math.floor((busDate.getTime() - currentTime.getTime()) / 1000);
      
      // Lógica NextBus (diff >= 0)
      if (diffSeconds >= 0 && diffSeconds < minDiffSeconds) {
        minDiffSeconds = diffSeconds;
        nextBus = timeStr;
      }
  
      // Lógica LastBus (diff < 0)
      if (diffSeconds < 0 && diffSeconds > maxDiffSeconds) {
        maxDiffSeconds = diffSeconds;
        lastBus = timeStr;
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
    
    const nextIndex = schedule.indexOf(nextBus);
    if (nextIndex === -1) return [];
    
    return schedule.slice(nextIndex, nextIndex + count);
  };
  
