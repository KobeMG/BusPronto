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


