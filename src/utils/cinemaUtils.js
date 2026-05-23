import { shareContent } from './shareUtils';

/**
 * Lógica para compartir una película del Cine Universitario.
 * @param {Object} movie - Objeto con la información de la película.
 * @param {string} formattedDate - Fecha formateada.
 * @param {string} formattedTime - Hora formateada.
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

    return await shareContent(shareData, 'Información de la película copiada al portapapeles.');
};
