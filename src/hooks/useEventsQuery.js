import { useQuery } from '@tanstack/react-query';
import { getUniversityEvents } from '../services/events.service';

export const useEventsQuery = () => {
    return useQuery({
        queryKey: ['universityEvents'],
        queryFn: getUniversityEvents,
        staleTime: 10 * 60 * 1000, // 10 minutos de caché
    });
};
