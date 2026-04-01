import { useQuery } from '@tanstack/react-query';
import { getExternalService } from '../services/externalRoutesRegistry';

export const useExternalStopsQuery = (routeId) => {
    return useQuery({
        queryKey: ['externalStops', routeId],
        queryFn: async () => {
            if (!routeId) return [];
            const service = getExternalService(routeId);
            return await service.getStops();
        },
        enabled: !!routeId,
        staleTime: 5 * 60 * 1000, // 5 minutos de vigencia en caché
        retry: false, // No reintentar si la configuración tira ROUTE_NOT_SUPPORTED
    });
};
