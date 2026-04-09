/**
 * Utility functions for formatting dates and times for display.
 */

/**
 * Formats a YYYY-MM-DD date string into a friendly Spanish date.
 * Example: "2026-04-16" -> "Jueves, 16 de abril"
 * 
 * @param {string} dateString 
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  } catch {
    return dateString;
  }
};

/**
 * Formats a 24-hour time string into a 12-hour format with a.m./p.m.
 * Example: "18:30:00" -> "6:30 p.m."
 * 
 * @param {string} timeString 
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const [hourStr, minStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    hour = hour % 12 || 12;
    return `${hour}:${minStr} ${ampm}`;
  } catch {
    return timeString;
  }
};
