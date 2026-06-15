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
 * Registra una impresión (el anuncio fue seleccionado y mostrado al usuario).
 * @param {string} id - El ID del anuncio.
 */
export const trackAdImpression = async (id) => {
  try {
    await supabase.rpc('increment_ad_impressions', { ad_id: id });
  } catch (err) {
    console.error('Error tracking impression:', err);
  }
};
