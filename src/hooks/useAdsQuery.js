import { useQuery } from '@tanstack/react-query';
import { fetchAdsData } from '../utils/adBannerUtils';

/**
 * Hook to fetch all active ads with React Query for caching and optimization.
 * @returns {Object} query object containing ads data, loading state, etc.
 */
export const useAdsQuery = () => {
  return useQuery({
    queryKey: ['ads'],
    queryFn: fetchAdsData,
    staleTime: 1000 * 60 * 5, // 5 minutes of cache
    refetchOnWindowFocus: false, // Don't refetch every time user returns to tab unless data is stale
  });
};
