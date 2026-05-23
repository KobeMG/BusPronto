import { sileo } from 'sileo';

/**
 * Copia texto genérico al portapapeles y muestra notificaciones sileo.
 * @param {string} text - Texto a copiar.
 * @param {string} successDescription - Mensaje de éxito a mostrar.
 */
export const copyToClipboardText = async (text, successDescription = 'Contenido copiado al portapapeles.') => {
  try {
    await navigator.clipboard.writeText(text);
    sileo.success({
      title: '¡Copiado!',
      description: successDescription,
      position: 'top-center',
      duration: 2500
    });
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    sileo.error({
      title: 'Error al copiar',
      description: 'No se pudo copiar el contenido al portapapeles.',
      position: 'top-center'
    });
    return false;
  }
};

/**
 * Comparte cualquier contenido utilizando la Web Share API
 * con fallback a copiado al portapapeles.
 * @param {Object} shareData - Objeto con title, text, url a compartir.
 * @param {string} successDescription - Mensaje de éxito en fallback.
 */
export const shareContent = async (shareData, successDescription) => {
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        const textToCopy = shareData.text && shareData.url
          ? `${shareData.text}\n\nMás información en: ${shareData.url}`
          : (shareData.url || shareData.text);
        const success = await copyToClipboardText(textToCopy, successDescription);
        return { success, method: 'clipboard' };
      }
      return { success: false, error: 'User aborted' };
    }
  } else {
    const textToCopy = shareData.text && shareData.url
      ? `${shareData.text}\n\nMás información en: ${shareData.url}`
      : (shareData.url || shareData.text);
    const success = await copyToClipboardText(textToCopy, successDescription);
    return { success, method: 'clipboard' };
  }
};

/**
 * Comparte la aplicación web utilizando la utilidad genérica.
 */
export const shareApp = async () => {
  const shareData = {
    title: 'BusPronto – Horarios Bus UCR',
    text: 'Consulte el próximo bus UCR en tiempo real. ¡No pierda su bus!',
    url: 'https://www.buspronto.lat/',
  };

  return await shareContent(shareData, 'El enlace de BusPronto se ha copiado al portapapeles.');
};
