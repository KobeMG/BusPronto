import { useQuery } from '@tanstack/react-query';
import { getStopById } from '../services/stops.service';

export const useStopDetailsQuery = (stopId) => {
    return useQuery({
        queryKey: ['stop', stopId],
        queryFn: () => getStopById(stopId),
        staleTime: 5 * 60 * 1000, // 5 minutos de vigencia en caché
        enabled: !!stopId, // Solo se ejecuta si hay un stopId válido
    });
};
