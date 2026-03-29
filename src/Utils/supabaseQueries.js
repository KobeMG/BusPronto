import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all available stops from the database.
 * @returns {Promise<Array>} A list of stops ordered by name.
 */
export const getStops = async () => {
    try {
        /*  const { data, error } = await supabase
             .from('stops')
             .select('*')
             .order('name');
 
         if (error) throw error;
         return data || []; */

        //TODO; Eliminar cuando se haga conexion oficial con BD.    
        const data = [{ "id": "f23010cc-e83f-42d0-bb3f-de261239da0d", "name": "Artes Plásticas", "internal_id": "artes_plasticas", "created_at": "2026-03-27T03:25:07.913531+00:00" },
        { "id": "6149be64-7cb4-4f5c-80e7-59ebf646ab1d", "name": "Facultad de Educación", "internal_id": "facultad_educacion", "created_at": "2026-03-27T03:25:07.913531+00:00" },
        { "id": "f62acd72-dcf8-48c4-a0e1-fa2f4ab2a298", "name": "Facultad de Odontología", "internal_id": "facultad_odontologia", "created_at": "2026-03-27T03:25:07.913531+00:00" }]

        return data;
    } catch (err) {
        console.error('Error in getStops:', err);
        throw err;
    }
};

/**
 * Fetches a single stop by its internal_id or id.
 * @param {string} stopId The ID to search for.
 * @returns {Promise<Object>} The stop record.
 */
export const getStopById = async (stopId) => {
    try {
       // console.log('Fetching stop with ID:', stopId);

        // Verificamos si el stopId tiene formato de UUID para evitar errores de casteo en PostgreSQL
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stopId);

        let query = supabase
            .from('stops')
            .select(`
                *,
                schedules (
                    departure_time
                )
            `);

        if (isUuid) {
            // Si es UUID, buscamos en ambas columnas (por si internal_id también fuera un UUID)
            query = query.or(`id.eq.${stopId},internal_id.eq.${stopId}`);
        } else {
            // Si no es UUID, solo buscamos en internal_id para evitar error 22P02
            query = query.eq('internal_id', stopId);
        }

        const { data: stop, error: stopError } = await query.single();

        if (stopError) {
            console.error('Error fetching stop:', stopError);
            throw stopError;
        }

        // Formateamos los horarios (HH:mm) y los ordenamos
        if (stop.schedules && stop.schedules.length > 0) {
            stop.formattedSchedules = stop.schedules
                .filter(s => s.departure_time)
                .map(s => s.departure_time.substring(0, 5))
                .sort();
        } else {
            stop.formattedSchedules = [];
        }

        console.log('Found stop with schedules:', stop);
        return stop;
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
        console.log('Fetching schedules for stop ID:', stopId);
        const { data: schedules, error: scheduleError } = await supabase
            .from('schedules')
            .select('departure_time')
            .eq('stop_id', stopId)
            .order('departure_time');

        if (scheduleError) {
            console.error('Error fetching schedules:', scheduleError);
            throw scheduleError;
        }

        console.log('Schedules found:', schedules);

        // Format time strings (HH:mm)
        return (schedules || []).map(s => s.departure_time.substring(0, 5));
    } catch (err) {
        console.error('Error in getSchedulesByStopId:', err);
        throw err;
    }
};
