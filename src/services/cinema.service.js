import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all upcoming movies from the university cinema table.
 * @returns {Promise<Array>} A list of movies ordered by screening date.
 */
export const getUpcomingMovies = async () => {
    try {
        const { data, error } = await supabase
            .from('university_cinema')
            .select('*')
            .order('screening_date', { ascending: true })
            .order('screening_time', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getUpcomingMovies:', err);
        throw err;
    }
};
