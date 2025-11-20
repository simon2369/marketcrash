import { useQueries } from '@tanstack/react-query';
import { EconomicIndicatorResponse } from '@/lib/api/economicIndicators';

/**
 * Combined economic indicators response
 */
export interface CombinedEconomicIndicators {
  cape: EconomicIndicatorResponse;
  yieldCurve: EconomicIndicatorResponse;
  marginDebt: EconomicIndicatorResponse;
  creditSpreads: EconomicIndicatorResponse;
  buffett: EconomicIndicatorResponse;
}

/**
 * Return type for useEconomicIndicators hook
 */
export interface UseEconomicIndicatorsReturn {
  data: CombinedEconomicIndicators | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom React hook to fetch all economic indicators
 * Automatically refetches every 5 minutes (economic data updates less frequently)
 * 
 * @returns {UseEconomicIndicatorsReturn} Object containing combined data, loading state, error, and refetch function
 */
export function useEconomicIndicators(): UseEconomicIndicatorsReturn {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['economic-indicators', 'cape'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/economic-indicators/cape');
            const data = await response.json();
            if (data.error) {
              // Return fallback data instead of throwing
              return {
                value: 0,
                status: 'safe' as const,
                historicalAvg: 16.8,
                warningLevel: 25,
                dangerLevel: 30,
                timestamp: new Date().toISOString(),
                description: 'Shiller P/E - Cyclically Adjusted Price-to-Earnings',
              } as EconomicIndicatorResponse;
            }
            return data as EconomicIndicatorResponse;
          } catch (error) {
            // Return fallback data on network errors
            return {
              value: 0,
              status: 'safe' as const,
              historicalAvg: 16.8,
              warningLevel: 25,
              dangerLevel: 30,
              timestamp: new Date().toISOString(),
              description: 'Shiller P/E - Cyclically Adjusted Price-to-Earnings',
            } as EconomicIndicatorResponse;
          }
        },
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        refetchIntervalInBackground: true,
        staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
        gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['economic-indicators', 'yield-curve'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/economic-indicators/yield-curve');
            const data = await response.json();
            if (data.error) {
              return {
                value: 0,
                status: 'safe' as const,
                historicalAvg: 1.5,
                warningLevel: 0.5,
                dangerLevel: 0,
                timestamp: new Date().toISOString(),
                description: '10-Year minus 3-Month Treasury Spread',
              } as EconomicIndicatorResponse;
            }
            return data as EconomicIndicatorResponse;
          } catch (error) {
            return {
              value: 0,
              status: 'safe' as const,
              historicalAvg: 1.5,
              warningLevel: 0.5,
              dangerLevel: 0,
              timestamp: new Date().toISOString(),
              description: '10-Year minus 3-Month Treasury Spread',
            } as EconomicIndicatorResponse;
          }
        },
        refetchInterval: 5 * 60 * 1000,
        refetchIntervalInBackground: true,
        staleTime: 4 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['economic-indicators', 'margin-debt'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/economic-indicators/margin-debt');
            const data = await response.json();
            if (data.error) {
              return {
                value: 0,
                status: 'safe' as const,
                historicalAvg: 1.8,
                warningLevel: 2.5,
                dangerLevel: 3.0,
                timestamp: new Date().toISOString(),
                description: 'Margin Debt as % of GDP',
              } as EconomicIndicatorResponse;
            }
            return data as EconomicIndicatorResponse;
          } catch (error) {
            return {
              value: 0,
              status: 'safe' as const,
              historicalAvg: 1.8,
              warningLevel: 2.5,
              dangerLevel: 3.0,
              timestamp: new Date().toISOString(),
              description: 'Margin Debt as % of GDP',
            } as EconomicIndicatorResponse;
          }
        },
        refetchInterval: 5 * 60 * 1000,
        refetchIntervalInBackground: true,
        staleTime: 4 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['economic-indicators', 'credit-spreads'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/economic-indicators/credit-spreads');
            const data = await response.json();
            if (data.error) {
              return {
                value: 0,
                status: 'safe' as const,
                historicalAvg: 4.0,
                warningLevel: 5.0,
                dangerLevel: 7.0,
                timestamp: new Date().toISOString(),
                description: 'ICE BofA High Yield Option-Adjusted Spread',
              } as EconomicIndicatorResponse;
            }
            return data as EconomicIndicatorResponse;
          } catch (error) {
            return {
              value: 0,
              status: 'safe' as const,
              historicalAvg: 4.0,
              warningLevel: 5.0,
              dangerLevel: 7.0,
              timestamp: new Date().toISOString(),
              description: 'ICE BofA High Yield Option-Adjusted Spread',
            } as EconomicIndicatorResponse;
          }
        },
        refetchInterval: 5 * 60 * 1000,
        refetchIntervalInBackground: true,
        staleTime: 4 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['economic-indicators', 'buffett'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/economic-indicators/buffett');
            const data = await response.json();
            if (data.error) {
              return {
                value: 0,
                status: 'safe' as const,
                historicalAvg: 80,
                warningLevel: 115,
                dangerLevel: 160,
                timestamp: new Date().toISOString(),
                description: 'Market Cap / GDP Ratio',
              } as EconomicIndicatorResponse;
            }
            return data as EconomicIndicatorResponse;
          } catch (error) {
            return {
              value: 0,
              status: 'safe' as const,
              historicalAvg: 80,
              warningLevel: 115,
              dangerLevel: 160,
              timestamp: new Date().toISOString(),
              description: 'Market Cap / GDP Ratio',
            } as EconomicIndicatorResponse;
          }
        },
        refetchInterval: 5 * 60 * 1000,
        refetchIntervalInBackground: true,
        staleTime: 4 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    ],
  });

  const [capeQuery, yieldCurveQuery, marginDebtQuery, creditSpreadsQuery, buffettQuery] = queries;

  // Combine loading states
  const isLoading = capeQuery.isLoading || yieldCurveQuery.isLoading || marginDebtQuery.isLoading || creditSpreadsQuery.isLoading || buffettQuery.isLoading;

  // Combine errors - return first error found
  const error = capeQuery.error || yieldCurveQuery.error || marginDebtQuery.error || creditSpreadsQuery.error || buffettQuery.error || null;

  // Combine data - always return data structure with fallbacks
  const data: CombinedEconomicIndicators | undefined =
    capeQuery.data && yieldCurveQuery.data && marginDebtQuery.data && creditSpreadsQuery.data && buffettQuery.data
      ? {
          cape: capeQuery.data,
          yieldCurve: yieldCurveQuery.data,
          marginDebt: marginDebtQuery.data,
          creditSpreads: creditSpreadsQuery.data,
          buffett: buffettQuery.data,
        }
      : undefined;

  // Refetch function that refetches all queries
  const refetch = () => {
    capeQuery.refetch();
    yieldCurveQuery.refetch();
    marginDebtQuery.refetch();
    creditSpreadsQuery.refetch();
    buffettQuery.refetch();
  };

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

