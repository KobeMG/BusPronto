import { useState, useMemo } from 'react';
import { DAYS_ES, getInitialBusDay, calculateBuses } from '../utils/timeHelpers';

/**
 * Hook personalizado para manejar la lógica de horarios de buses.
 * 
 * Este hook centraliza:
 * 1. El estado de la vista (Cronómetro interactivo vs Lista completa).
 * 2. El estado del selector de días (L-V, Sáb, Dom).
 * 3. El filtrado inteligente de horarios basado en el día seleccionado.
 * 4. La detección del "Próximo Bus" para resaltado en tiempo real.
 * 
 * Ayuda a eliminar la duplicación de código entre BusStop y ExternalBusStop.
 * 
 * @param {Array} baseSchedule - Lista de objetos de horario { time, destination, days }.
 */
export const useSchedule = (baseSchedule) => {
  const [view, setView] = useState('timer'); // 'timer' | 'schedule'
  const [selectedDay, setSelectedDay] = useState(getInitialBusDay());

  const todayIndex = new Date().getDay();
  const todayName = DAYS_ES[todayIndex];

  // Filtrar horarios que aplican para el día seleccionado
  const schedule = useMemo(() => {
    return (baseSchedule || []).filter(s => {
      if (!s.days || !Array.isArray(s.days)) return true;
      if (selectedDay === 'Lunes') {
        // En nuestro DaySelector, 'Lunes' representa el bloque Lunes-Viernes
        return s.days.some(d => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(d));
      }
      return s.days.includes(selectedDay);
    });
  }, [baseSchedule, selectedDay]);

  // Obtener el próximo bus solo si el día seleccionado es HOY para resaltarlo
  const { nextBus } = useMemo(() => {
    const now = new Date();
    const isToday = selectedDay === todayName || (selectedDay === 'Lunes' && todayIndex >= 1 && todayIndex <= 5);
    
    if (!isToday) return { nextBus: null };
    return calculateBuses(schedule, now);
  }, [schedule, selectedDay, todayIndex, todayName]);

  const nextBusTime = typeof nextBus === 'string' ? nextBus : nextBus?.time;

  return {
    view,
    setView,
    selectedDay,
    setSelectedDay,
    schedule,
    nextBusTime,
    todayName,
    todayIndex
  };
};
