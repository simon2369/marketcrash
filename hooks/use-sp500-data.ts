import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getSP500CurrentPrice } from '@/lib/api/alpha-vantage';
import { MarketData } from '@/lib/types';
import { AlphaVantageError } from '@/lib/api/alpha-vantage';

export interface UseSP500DataReturn {
  data: MarketData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom React hook to fetch S&P 500 data from Alpha Vantage API
 * Automatically refetches every 30 seconds
 * 
 * @returns {UseSP500DataReturn} Object containing data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSP500Data();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return <div>Current Price: ${data?.price}</div>;
 * ```
 */
export function useSP500Data(): UseSP500DataReturn {
  const queryResult: UseQueryResult<MarketData, Error> = useQuery({
    queryKey: ['sp500', 'current-price'],
    queryFn: async () => {
      try {
        return await getSP500CurrentPrice();
      } catch (error) {
        // Transform AlphaVantageError to standard Error for consistency
        if (error instanceof AlphaVantageError) {
          throw new Error(error.message);
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is in background
    staleTime: 25000, // Consider data stale after 25 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes (formerly cacheTime)
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
}

