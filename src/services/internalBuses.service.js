import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all available internal stops from the database.
 * @returns {Promise<Array>} A list of stops ordered by name.
 */
export const getInternalStops = async () => {
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
        console.error('Error in getInternalStops:', err);
        throw err;
    }
};

/**
 * Fetches a single internal stop and its completely formatted schedule.
 * @param {string} stopId The ID (internal or numeric) to search for.
 * @returns {Promise<Object>} The stop record with its schedules.
 */
export const getInternalStopById = async (stopId) => {
    try {
        // 1. Obtenemos la información básica de la parada
        const isNumeric = /^\d+$/.test(stopId);
        let query = supabase.from('stops').select('id, name, internal_id');

        if (isNumeric) {
            query = query.or(`id.eq.${stopId},internal_id.eq.${stopId}`);
        } else {
            query = query.eq('internal_id', stopId);
        }

        const { data: stopData, error: stopError } = await query.single();
        if (stopError) throw stopError;

        // 2. Usar vista para traer los horarios limpios
        // Como la vista ya trae todo filtrado por 'interno' y ordenado, es directo.
        const { data: scheduleData, error: scheduleError } = await supabase
            .from('v_horarios_internos')
            .select('hora_salida, parada_destino, dias_activos')
            .eq('parada_origen', stopData.name)
            .order('hora_salida', { ascending: true });

        if (scheduleError) throw scheduleError;

        // 3. Formateamos la hora (quitamos los segundos de '06:30:00' a '06:30')
        // y eliminamos duplicados si existieran (ej. dos rutas saliendo a la misma hora)
        const uniqueTimes = new Map();
        (scheduleData || []).forEach(h => {
            const timeParsed = h.hora_salida.substring(0, 5);
            const key = `${timeParsed}-${h.parada_destino}`;
            if (!uniqueTimes.has(key)) {
                uniqueTimes.set(key, {
                    time: timeParsed,
                    destination: h.parada_destino,
                    days: h.dias_activos,
                    //fare: h.tarifa
                });
            }
        });

        return {
            id: stopData.id,
            name: stopData.name,
            internal_id: stopData.internal_id,
            formattedSchedules: Array.from(uniqueTimes.values())
        };

    } catch (err) {
        console.error('Error in getInternalStopById:', err);
        throw err;
    }
};