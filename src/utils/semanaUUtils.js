export const groupEventsByDate = (events) => {
    if (!events) return [];

    const groups = events.reduce((acc, event) => {
        const dateStr = event.event_date;
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(event);
        return acc;
    }, {});

    // Convertimos a array ordenado
    return Object.entries(groups)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, eventList]) => ({
            date,
            eventList
        }));
};

export const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00'); // Evitar problemas de timezone
    return {
        day: new Intl.DateTimeFormat('es-CR', { weekday: 'long' }).format(date),
        full: new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' }).format(date)
    };
};

export const formatEventTime = (timeString) => {
    if (!timeString) return null;

    try {
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
        return null;
    }
};
