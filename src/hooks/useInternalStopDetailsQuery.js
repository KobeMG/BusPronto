import { useQuery } from '@tanstack/react-query';
import { getInternalStopById } from '../services/internalBuses.service';

export const useInternalStopDetailsQuery = (stopId) => {
    return useQuery({
        queryKey: ['internalStop', stopId],
        queryFn: () => getInternalStopById(stopId),
        staleTime: 5 * 60 * 1000, // 5 minutos de vigencia en caché
        enabled: !!stopId, // Solo se ejecuta si hay un stopId válido
    });
};
