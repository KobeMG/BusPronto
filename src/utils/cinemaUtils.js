/**
 * Lógica para compartir una película del Cine Universitario
 */
export const shareMovie = async (movie, formattedDate, formattedTime) => {
    const { title, location_name, virtual } = movie;

    const location = virtual ? `Vía Zoom - ${location_name}` : `Presencial - ${location_name}`;

    const shareText = `¿Y si vamos al cine?\n\n🎬 ${title}\n📅 Fecha: ${formattedDate || 'Por definir'}\n⏰ Hora: ${formattedTime || 'Por definir'}\n📍 Lugar: ${location}`;

    const shareData = {
        title: `${title} - Cine Universitario`,
        text: shareText,
        url: 'https://www.buspronto.lat/cine'
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
            await navigator.clipboard.writeText(`${shareData.text}\n\nMás funciones en: ${shareData.url}`);
            return { success: true, method: 'clipboard' };
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            return { success: false, error: err };
        }
    }
};
