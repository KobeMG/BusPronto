import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all active bus alerts from the database.
 * @returns {Promise<Array>} A list of active alerts ordered by creation date descending.
 */
export const getActiveAlerts = async () => {
    try {
        const { data, error } = await supabase
            .from('bus_alerts')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getActiveAlerts:', err);
        throw err;
    }
};
