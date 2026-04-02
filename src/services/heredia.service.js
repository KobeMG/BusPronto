import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all available stops for the Alajuela route from the database.
 * @returns {Promise<Array>} A list of stops ordered by name.
 */
export const getHerediaStops = async () => {
    try {
        const { data, error } = await supabase
            .from('v_salidas_heredia')
            .select('*')
            .order('nombre_parada');

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.parada_id,
            name: row.nombre_parada,
            internal_id: row.identificador
        }));

    } catch (err) {
        console.error('Error in getAlajuelaStops:', err);
        throw err;
    }
};

/**
 * Fetches the schedule for a given Alajuela stop, including days and fares.
 * @param {string} stopId Internal or UUID stop ID. 
 * @returns {Promise<Object>} The stop record with fully formatted schedules.
 */
export const getHerediaStopDetails = async (stopId) => {
    try {
        // 1. Obtenemos la información básica de la parada desde la tabla 'stops'
        const isNumeric = /^\d+$/.test(stopId);
        let query = supabase.from('stops').select('id, name, internal_id');

        if (isNumeric) {
            query = query.or(`id.eq.${stopId},internal_id.eq.${stopId}`);
        } else {
            query = query.eq('internal_id', stopId);
        }

        const { data: stopData, error: stopError } = await query.single();
        if (stopError) throw stopError;

        // 2. Consultamos la vista de horarios específica de Alajuela
        // Traemos también los días activos y la tarifa que son cruciales para rutas externas
        const { data: scheduleData, error: scheduleError } = await supabase
            .from('v_horarios_heredia')
            .select('hora_salida, parada_destino, dias_activos, tarifa')
            .eq('parada_origen', stopData.name)
            .order('hora_salida', { ascending: true });

        if (scheduleError) throw scheduleError;

        // 3. Formateamos y enriquecemos los datos para el frontend
        const uniqueTimes = new Map();

        (scheduleData || []).forEach(h => {
            const timeParsed = h.hora_salida.substring(0, 5);

            // Usamos una llave compuesta por hora y destino por seguridad
            const key = `${timeParsed}-${h.parada_destino}`;

            if (!uniqueTimes.has(key)) {
                uniqueTimes.set(key, {
                    time: timeParsed,
                    destination: h.parada_destino,
                    days: h.dias_activos,
                    fare: h.tarifa
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
        console.error('Error in getHerediaStopDetails:', err);
        throw err;
    }
};