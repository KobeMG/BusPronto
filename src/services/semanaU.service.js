import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all visible university events from the database.
 * @returns {Promise<Array>} A list of events ordered by event_date.
 */
export const getUniversityEvents = async () => {
    try {
        const { data, error } = await supabase
            .from('university_events')
            .select('*')
            .eq('is_visible', true)
            .order('event_date', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getUniversityEvents:', err);
        throw err;
    }
};
