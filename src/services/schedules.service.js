import { supabase } from '../lib/supabaseClient';

export const getTransportSystems = async () => {
    const { data, error } = await supabase
        .from('transport_systems')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
};

export const getRoutesBySystem = async (systemId) => {
    const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('system_id', systemId)
        .order('name');

    if (error) throw error;
    return data || [];
};

export const getStops = async () => {
    const { data, error } = await supabase
        .from('stops')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
};

export const getSchedulesByRoute = async (routeId) => {
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
};

export const deleteSchedule = async (id) => {
    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const createSchedules = async (schedulesData) => {
    // schedulesData is an array of objects to insert
    const { data, error } = await supabase
        .from('schedules')
        .insert(schedulesData)
        .select();

    if (error) throw error;
    return data;
};
