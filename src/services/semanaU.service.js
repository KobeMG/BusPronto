import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all visible university events from the database (public-facing).
 * @returns {Promise<Array>} A list of visible events ordered by event_date_start and start_time.
 */
export const getUniversityEvents = async () => {
    try {
        const { data, error } = await supabase
            .from('university_events')
            .select('*')
            .eq('is_visible', true)
            .order('event_date_start', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getUniversityEvents:', err);
        throw err;
    }
};

/**
 * Fetches ALL university events (admin view — no visibility filter).
 * Requires authenticated admin session.
 * @returns {Promise<Array>} All events ordered by event_date_start.
 */
export const getAllEventsAdmin = async () => {
    try {
        const { data, error } = await supabase
            .from('university_events')
            .select('*')
            .order('event_date_start', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getAllEventsAdmin:', err);
        throw err;
    }
};

/**
 * Creates a new university event.
 * Requires authenticated admin session with INSERT policy.
 * @param {Object} eventData - The event fields to insert.
 * @returns {Promise<Object>} The inserted record.
 */
export const createEvent = async (eventData) => {
    try {
        const { data, error } = await supabase
            .from('university_events')
            .insert([eventData])
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        console.error('Error in createEvent:', err);
        throw err;
    }
};

/**
 * Updates an existing university event by ID.
 * Requires authenticated admin session with UPDATE policy.
 * @param {number} id - The event ID to update.
 * @param {Object} updates - The fields to update.
 * @returns {Promise<Object>} The updated record.
 */
export const updateEvent = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('university_events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        console.error('Error in updateEvent:', err);
        throw err;
    }
};

/**
 * Deletes a university event by ID.
 * Requires authenticated admin session with DELETE policy.
 * @param {number} id - The event ID to delete.
 */
export const deleteEvent = async (id) => {
    try {
        const { error } = await supabase
            .from('university_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (err) {
        console.error('Error in deleteEvent:', err);
        throw err;
    }
};

/**
 * Toggles the is_visible field of a university event.
 * @param {number} id - The event ID.
 * @param {boolean} currentValue - The current value of is_visible.
 * @returns {Promise<Object>} The updated record.
 */
export const toggleEventVisibility = async (id, currentValue) => {
    return updateEvent(id, { is_visible: !currentValue });
};
