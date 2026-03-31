import { useQuery } from '@tanstack/react-query';
import { getInternalStops } from '../services/internalBuses.service';

export const useInternalStopsQuery = () => {
    return useQuery({
        queryKey: ['internalStops'],
        queryFn: getInternalStops,
        staleTime: 5 * 60 * 1000, // 5 minutos de vigencia en caché
    });
};
