import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all available stops from the database.
 * @returns {Promise<Array>} A list of stops ordered by name.
 */
export const getStops = async () => {
    try {
        const { data, error } = await supabase
            .from('v_salidas_internas')
            .select('*')
            .order('nombre_parada');

        if (error) throw error;
        
        return (data || []).map(row => ({
            id: row.parada_id,
            name: row.nombre_parada,
            internal_id: row.identificador
        }));

    } catch (err) {
        console.error('Error in getStops:', err);
        throw err;
    }
};

// Función pura (Helper) para filtrar y dar formato a los horarios de buses internos
const formatInternalSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) return [];

    const uniqueTimes = new Map();

    for (const h of schedules) {
        // Ignoramos si no tiene hora de salida o si no pertenece a una ruta interna
        if (!h.departure_time || h.routes?.type !== 'interno') continue;

        const timeParsed = String(h.departure_time).substring(0, 5);
        
        // El mapa garantiza que no habrán dos salidas a la misma hora para esta parada
        if (!uniqueTimes.has(timeParsed)) {
            uniqueTimes.set(timeParsed, {
                time: timeParsed,
                destination: h.destination?.name || null
            });
        }
    }

    return Array.from(uniqueTimes.values()).sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Fetches a single stop by its internal_id or id.
 * @param {string} stopId The ID to search for.
 * @returns {Promise<Object>} The stop record.
 */
export const getStopById = async (stopId) => {
    try {
        const baseQuery = supabase
            .from('stops')
            .select(`
                id, name, internal_id,
                schedules!origin_stop_id (
                    departure_time,
                    destination:stops!destination_stop_id ( name ),
                    routes!inner ( type )
                )
            `);

        // Aplicamos la condicional de búsqueda directamente a la Promesa
        const query = /^\d+$/.test(stopId)
            ? baseQuery.or(`id.eq.${stopId},internal_id.eq.${stopId}`)
            : baseQuery.eq('internal_id', stopId);

        const { data: routeData, error } = await query.single();

        if (error) throw error; // El bloque catch de abajo de encargará de consologuearlo

        return {
            id: routeData.id,
            name: routeData.name,
            internal_id: routeData.internal_id,
            formattedSchedules: formatInternalSchedules(routeData.schedules)
        };
    } catch (err) {
        console.error('Error in getStopById:', err);
        throw err;
    }
};

/**
 * Fetches the schedule for a given stop.
 * @param {string} stopId Internal or UUID stop ID. (Internal preferred for simplicity)
 * @returns {Promise<Array>} A list of departure times (formatted as HH:mm)
 */
export const getSchedulesByStopId = async (stopId) => {
    try {
        console.log('Fetching schedules for stop ID from view:', stopId);
        
        const isNumeric = /^\d+$/.test(stopId);
        let query = supabase
            .from('v_salidas_internas')
            .select('salidas');
            
        if (isNumeric) {
            query = query.or(`parada_id.eq.${stopId},identificador.eq.${stopId}`);
        } else {
            query = query.eq('identificador', stopId);
        }

        const { data: row, error: scheduleError } = await query.single();

        if (scheduleError) {
            console.error('Error fetching schedules:', scheduleError);
            throw scheduleError;
        }

        if (!row || !row.salidas) return [];

        const times = row.salidas.map(s => String(s).substring(0, 5));
        return Array.from(new Set(times)).sort();
    } catch (err) {
        console.error('Error in getSchedulesByStopId:', err);
        throw err;
    }
};
