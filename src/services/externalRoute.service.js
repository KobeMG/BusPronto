import { supabase } from '../lib/supabaseClient';

const viewName = (route) => ({
  stops: `v_salidas_${route}`,
  schedules: `v_horarios_${route}`,
});

export const getExternalStops = async (route) => {
  try {
    const { data, error } = await supabase
      .from(viewName(route).stops)
      .select('*')
      .order('nombre_parada');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.parada_id,
      name: row.nombre_parada,
      internal_id: row.identificador,
    }));
  } catch (err) {
    console.error(`Error in getExternalStops (${route}):`, err);
    throw err;
  }
};

export const getExternalStopDetails = async (route, stopId) => {
  try {
    const isNumeric = /^\d+$/.test(stopId);
    let query = supabase.from('stops').select('id, name, internal_id');

    if (isNumeric) {
      query = query.or(`id.eq.${stopId},internal_id.eq.${stopId}`);
    } else {
      query = query.eq('internal_id', stopId);
    }

    const { data: stopData, error: stopError } = await query.single();
    if (stopError) throw stopError;

    const { data: scheduleData, error: scheduleError } = await supabase
      .from(viewName(route).schedules)
      .select('hora_salida, parada_destino, dias_activos, tarifa')
      .eq('parada_origen', stopData.name)
      .order('hora_salida', { ascending: true });

    if (scheduleError) throw scheduleError;

    const uniqueTimes = new Map();

    (scheduleData || []).forEach(h => {
      const timeParsed = h.hora_salida.substring(0, 5);
      const key = `${timeParsed}-${h.parada_destino}`;

      if (!uniqueTimes.has(key)) {
        uniqueTimes.set(key, {
          time: timeParsed,
          destination: h.parada_destino,
          days: h.dias_activos,
          fare: h.tarifa,
        });
      }
    });

    return {
      id: stopData.id,
      name: stopData.name,
      internal_id: stopData.internal_id,
      formattedSchedules: Array.from(uniqueTimes.values()),
    };
  } catch (err) {
    console.error(`Error in getExternalStopDetails (${route}):`, err);
    throw err;
  }
};
