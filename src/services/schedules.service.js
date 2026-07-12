import { supabase } from '../lib/supabaseClient';

export const getTransportSystems = async () => {
    try {
        const { data, error } = await supabase
            .from('transport_systems')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error in getTransportSystems:', err);
        throw err;
    }
};

export const getRoutesBySystem = async (systemId) => {
    try {
        const { data, error } = await supabase
            .from('routes')
            .select('*')
            .eq('system_id', systemId)
            .order('name');
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error in getRoutesBySystem:', err);
        throw err;
    }
};

export const getStops = async () => {
    try {
        const { data, error } = await supabase
            .from('stops')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error in getStops:', err);
        throw err;
    }
};

export const getSchedulesByRoute = async (routeId) => {
    try {
        const { data, error } = await supabase
            .from('schedules')
            .select(`
                *,
                origin_stop:stops!origin_stop_id(name),
                destination_stop:stops!destination_stop_id(name)
            `)
            .eq('route_id', routeId)
            .order('departure_time');
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error in getSchedulesByRoute:', err);
        throw err;
    }
};

export const deleteSchedule = async (id) => {
    try {
        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error in deleteSchedule:', err);
        throw err;
    }
};

export const createSchedules = async (schedulesData) => {
    try {
        // schedulesData is an array of objects to insert
        const { data, error } = await supabase
            .from('schedules')
            .insert(schedulesData)
            .select();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error in createSchedules:', err);
        throw err;
    }
};
