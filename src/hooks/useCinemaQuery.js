import { useQuery } from '@tanstack/react-query';
import { getUpcomingMovies } from '../services/cinema.service';

/**
 * Hook to fetch upcoming movies with React Query for caching.
 * @returns {Object} query object
 */
export const useCinemaQuery = () => {
    return useQuery({
        queryKey: ['university_cinema'],
        queryFn: getUpcomingMovies,
        staleTime: 1000 * 60 * 30, // 30 minutes of cache
        cacheTime: 1000 * 60 * 60, // 1 hour of potential reuse
    });
};
