import { getAlajuelaStops, getAlajuelaStopDetails } from './alajuela.service';
import { getHerediaStops, getHerediaStopDetails } from './heredia.service';
/**
 * Registro central de servicios para rutas externas.
 * Mapea un `routeId` dinámico a las funciones específicas de la ruta.
 * Esto permite añadir nuevas rutas sin tocar el frontend, manteniendo la nomenclatura
 * específica de cada servicio (ej. getAlajuelaStops) internamente.
 */
const registry = {
    alajuela: {
        getStops: getAlajuelaStops,
        getStopDetails: getAlajuelaStopDetails,
    },
    // Añadir el resto de rutas aquí en el futuro:
    heredia: {
        getStops: getHerediaStops,
        getStopDetails: getHerediaStopDetails,
    }
};

/**
 * Obtiene el servicio correspondiente a una ruta externa.
 * @param {string} routeId - El identificador de la ruta (ej: 'alajuela').
 * @returns {Object} El objeto con `getStops` y `getStopDetails` para la ruta.
 * @throws Error si la ruta no está registrada.
 */
export const getExternalService = (routeId) => {
    if (!routeId) throw new Error('ROUTE_ID_REQUIRED');

    // Normalizamos manejando minúsculas
    const normalizedRouteId = routeId.toLowerCase();
    const service = registry[normalizedRouteId];

    if (!service) {
        throw new Error('ROUTE_NOT_SUPPORTED');
    }

    return service;
};
