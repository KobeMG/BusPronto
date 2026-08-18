import { useQuery } from '@tanstack/react-query';
import { getExternalStopDetails } from '../services/externalRoute.service';

export const useExternalStopDetailsQuery = (routeId, stopId) => {
    return useQuery({
        queryKey: ['externalStop', routeId, stopId],
        queryFn: async () => {
            if (!routeId || !stopId) return null;
            return await getExternalStopDetails(routeId, stopId);
        },
        enabled: !!routeId && !!stopId,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};
