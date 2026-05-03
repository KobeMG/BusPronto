import { supabase } from '../lib/supabaseClient';

/**
 * Mezcla aleatoriamente un array.
 * @param {Array} array 
 * @returns {Array}
 */
export const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Obtiene los anuncios activos de Supabase.
 * @returns {Promise<Array>}
 */
export const fetchAdsData = async () => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false }); //Ordenar los anuncios en funcion de la prioridad de la BD

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching ads:', err);
    return [];
  }
};

/**
 * Registra el clic de un anuncio.
 * @param {string} id 
 */
export const trackAdClick = async (id) => {
  try {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  } catch (err) {
    console.error('Error tracking click:', err);
  }
};
