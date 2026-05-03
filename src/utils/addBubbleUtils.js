import { supabase } from '../lib/supabaseClient';


/**
 * Registra el clic de un anuncio en la base de datos.
 * @param {string} id - El ID del anuncio.
 */
export const trackAdClick = async (id) => {
  try {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  } catch (err) {
    console.error('Error tracking click:', err);
  }
};

/**
 * Calcula los límites del contenedor principal de la app (max-width: 500px).
 * @param {number} screenWidth - El ancho de la pantalla actual.
 * @returns {{appLeft: number, appRight: number, appWidth: number}}
 */
export const getAppBounds = (screenWidth) => {
  const appWidth = Math.min(screenWidth, 500);
  const appLeft = Math.max(0, (screenWidth - 500) / 2);
  const appRight = appLeft + appWidth;
  return { appLeft, appRight, appWidth };
};

/**
 * Calcula a qué borde (izquierdo o derecho) debe pegarse la burbuja
 * respetando el contenedor de 500px.
 * @param {number} currentX - La posición actual en X de la burbuja.
 * @param {number} screenWidth - El ancho de la pantalla actual.
 * @returns {number} La posición final en X.
 */
export const calculateSnapX = (currentX, screenWidth) => {
  const { appLeft, appRight } = getAppBounds(screenWidth);
  const appCenter = appLeft + (appRight - appLeft) / 2;
  return currentX > appCenter ? appRight - 70 : appLeft + 10;
};
