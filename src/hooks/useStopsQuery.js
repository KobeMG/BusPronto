import { useQuery } from '@tanstack/react-query';
import { getStops } from '../services/stops.service';

export const useStopsQuery = () => {
    return useQuery({
        queryKey: ['stops'],
        queryFn: getStops,
        staleTime: 5 * 60 * 1000, // 5 minutos de vigencia en caché
    });
};
