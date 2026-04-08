import { useQuery } from '@tanstack/react-query';
import { getUniversityEvents } from '../services/semanaU.service';

export const useSemanaUQuery = () => {
    return useQuery({
        queryKey: ['universityEvents'],
        queryFn: getUniversityEvents,
        staleTime: 10 * 60 * 1000, // 10 minutos de caché
    });
};
