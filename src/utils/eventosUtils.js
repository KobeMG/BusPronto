const getDatesInRange = (start, finish) => {
    const dates = [];
    const current = new Date(start + 'T12:00:00');
    const end = new Date(finish + 'T12:00:00');
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

export const groupEventsByDate = (events) => {
    if (!events) return [];

    const groups = events.reduce((acc, event) => {
        const { event_date_start: start, event_date_finish: finish, recurrence_days } = event;
        let dates = (finish && finish !== start) ? getDatesInRange(start, finish) : [start];

        if (recurrence_days && recurrence_days.length > 0) {
            dates = dates.filter((dateStr) => {
                const dateObj = new Date(dateStr + 'T12:00:00');
                let dayIndex = dateObj.getDay();
                dayIndex = dayIndex === 0 ? 7 : dayIndex; // 1 = Lunes, 7 = Domingo
                return recurrence_days.includes(dayIndex);
            });
        }

        dates.forEach((dateStr) => {
            const dateObj = new Date(dateStr + 'T12:00:00');
            let dayIndex = dateObj.getDay();
            dayIndex = dayIndex === 0 ? 7 : dayIndex;

            if (!acc[dayIndex]) acc[dayIndex] = [];
            if (!acc[dayIndex].some(e => e.id === event.id)) {
                acc[dayIndex].push(event);
            }
        });

        return acc;
    }, {});

    const dayNames = {
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        7: 'Domingo'
    };

    return Object.entries(groups)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([id, eventList]) => ({
            id,
            dayName: dayNames[id],
            eventList: eventList.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
        }));
};

export const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00'); // Evitar problemas de timezone
    return {
        day: new Intl.DateTimeFormat('es-CR', { weekday: 'long' }).format(date),
        full: new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' }).format(date)
    };
};

export const formatDateRange = (startDateStr, finishDateStr) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr + 'T12:00:00');
    const startFormatted = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' }).format(start);

    if (!finishDateStr || finishDateStr === startDateStr) return startFormatted;

    const finish = new Date(finishDateStr + 'T12:00:00');

    if (start.getMonth() === finish.getMonth() && start.getFullYear() === finish.getFullYear()) {
        const month = new Intl.DateTimeFormat('es-CR', { month: 'long' }).format(start);
        return `${start.getDate()} al ${finish.getDate()} de ${month}`;
    }

    const finishFormatted = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' }).format(finish);
    return `${startFormatted} → ${finishFormatted}`;
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

    const shareText = `¡Mirá este evento!\n\n🎭 ${title}\n🎪 Organiza: ${organizer || 'Organización UCR'}\n📍 Lugar: ${location || 'Por definir'}${formattedTime ? `\n⏰ Hora: ${formattedTime}` : ''}`;
    const shareData = {
        title: `${title}`,
        text: shareText,
        url: `${window.location.origin}/eventos?id=${event.id}`
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
