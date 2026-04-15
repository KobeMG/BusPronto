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

/**
 * Lógica para compartir un evento
 */
export const shareEvent = async (event, formattedTime) => {
    const { title, organizer, location } = event;
    
    const shareText = `¡Mirá este evento de Semana U!\n\n🎭 ${title}\n🎪 Organiza: ${organizer || 'Organización UCR'}\n📍 Lugar: ${location || 'Por definir'}${formattedTime ? `\n⏰ Hora: ${formattedTime}` : ''}`;
    const shareData = {
        title: `${title} - Semana U 2026`,
        text: shareText,
        url: 'https://www.buspronto.lat/semana-u'
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return { success: true, method: 'native' };
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
                return { success: false, error: err };
            }
            return { success: false, error: 'User aborted' };
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${shareData.text}\n\nMás eventos en: ${shareData.url}`);
            return { success: true, method: 'clipboard' };
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            return { success: false, error: err };
        }
    }
};

/**
 * Retorna la configuración de iconos y estilos según la modalidad
 */
export const getEventModalityConfig = (modality, styles) => {
    switch (modality?.toLowerCase()) {
        case 'presencial':
            return { type: 'presencial', className: styles.presencial };
        case 'virtual':
            return { type: 'virtual', className: styles.virtual };
        case 'híbrido':
        case 'hibrido':
            return { type: 'hibrido', className: styles.hibrido };
        default:
            return { type: 'presencial', className: styles.presencial };
    }
};
