import { useQuery } from '@tanstack/react-query';
import { MarketNewsArticle } from '@/lib/api/marketData';

/**
 * Return type for useMarketNews hook
 */
export interface UseMarketNewsReturn {
  data: MarketNewsArticle[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom React hook to fetch market news
 * Automatically refetches every 30 minutes
 *
 * @returns {UseMarketNewsReturn} Object containing news data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMarketNews();
 *
 * if (isLoading) return <div>Loading news...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     {data?.map(article => (
 *       <div key={article.id}>{article.headline}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMarketNews(): UseMarketNewsReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<MarketNewsArticle[]>({
    queryKey: ['market-news'],
    queryFn: async () => {
      const response = await fetch('/api/market-news');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch market news');
      }
      return response.json() as Promise<MarketNewsArticle[]>;
    },
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    refetchIntervalInBackground: true,
    staleTime: 25 * 60 * 1000, // Consider data stale after 25 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

