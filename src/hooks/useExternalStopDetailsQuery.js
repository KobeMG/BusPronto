import { useQuery } from '@tanstack/react-query';
import { getExternalService } from '../services/externalRoutesRegistry';

export const useExternalStopDetailsQuery = (routeId, stopId) => {
    return useQuery({
        queryKey: ['externalStop', routeId, stopId],
        queryFn: async () => {
            if (!routeId || !stopId) return null;
            const service = getExternalService(routeId);
            return await service.getStopDetails(stopId);
        },
        enabled: !!routeId && !!stopId,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};
