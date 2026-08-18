import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all active bus alerts from the database.
 * @returns {Promise<Array>} A list of active alerts ordered by creation date descending.
 */
export const getActiveAlerts = async () => {
    const { data, error } = await supabase
        .from('bus_alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
};

/**
 * Fetches all alerts for admin dashboard (includes active & inactive).
 * @returns {Promise<Array>} A list of all alerts.
 */
export const getAllAlertsAdmin = async () => {
    const { data, error } = await supabase
        .from('bus_alerts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Creates a new bus alert.
 * @param {Object} alert - The alert data to insert.
 */
export const createAlert = async (alert) => {
    const { data, error } = await supabase
        .from('bus_alerts')
        .insert([alert])
        .select();

    if (error) throw error;
    return data?.[0];
};

/**
 * Updates an existing alert.
 * @param {string} id - The UUID of the alert.
 * @param {Object} alert - The updated alert fields.
 */
export const updateAlert = async (id, alert) => {
    const { data, error } = await supabase
        .from('bus_alerts')
        .update(alert)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data?.[0];
};

/**
 * Deletes a bus alert.
 * @param {string} id - The UUID of the alert.
 */
export const deleteAlert = async (id) => {
    const { error } = await supabase
        .from('bus_alerts')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

/**
 * Toggles the active status of an alert.
 * @param {string} id - The UUID of the alert.
 * @param {boolean} currentActive - The current active status.
 */
export const toggleAlertActive = async (id, currentActive) => {
    const { data, error } = await supabase
        .from('bus_alerts')
        .update({ active: !currentActive })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data?.[0];
};
