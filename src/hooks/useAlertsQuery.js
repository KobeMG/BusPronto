import { useQuery } from '@tanstack/react-query';
import { getActiveAlerts } from '../services/alerts.service';

/**
 * Hook to fetch active alerts with React Query for caching.
 * @returns {Object} query object
 */
export const useAlertsQuery = () => {
    return useQuery({
        queryKey: ['bus_alerts'],
        queryFn: getActiveAlerts,
        staleTime: 1000 * 60 * 5, // 5 minutes of cache
        cacheTime: 1000 * 60 * 10, // 10 minutes of potential reuse
    });
};
