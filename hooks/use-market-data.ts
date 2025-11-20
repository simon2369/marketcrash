import { useQueries } from '@tanstack/react-query';
import { MarketDataResponse } from '@/lib/api/marketData';

/**
 * Combined market data response
 */
export interface CombinedMarketData {
  sp500: MarketDataResponse;
  dowjones: MarketDataResponse;
  nasdaq: MarketDataResponse;
  vix: MarketDataResponse;
  stocks: {
    alphabet: MarketDataResponse;
    amazon: MarketDataResponse;
    apple: MarketDataResponse;
    tesla: MarketDataResponse;
    meta: MarketDataResponse;
    microsoft: MarketDataResponse;
    nvidia: MarketDataResponse;
  };
  crypto: {
    bitcoin: MarketDataResponse;
    ethereum: MarketDataResponse;
    xrp: MarketDataResponse;
  };
  commodities: {
    gold: MarketDataResponse;
    silver: MarketDataResponse;
    oil: MarketDataResponse;
  };
}

/**
 * Return type for useMarketData hook
 */
export interface UseMarketDataReturn {
  data: CombinedMarketData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom React hook to fetch both S&P 500 and VIX data
 * Automatically refetches every 30 seconds
 * 
 * @returns {UseMarketDataReturn} Object containing combined data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMarketData();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <div>S&P 500: ${data?.sp500.value}</div>
 *     <div>VIX: {data?.vix.value}</div>
 *   </div>
 * );
 * ```
 */
export function useMarketData(): UseMarketDataReturn {
  // Helper function to create fallback data
  const createFallback = (): MarketDataResponse => ({
    value: 0,
    change: 0,
    changePercent: 0,
    timestamp: new Date().toISOString(),
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: ['market-data', 'sp500'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/market-data/sp500');
            const data = await response.json();
            if (data.error) {
              // Return fallback data instead of throwing
              return {
                value: 0,
                change: 0,
                changePercent: 0,
                timestamp: new Date().toISOString(),
              } as MarketDataResponse;
            }
            return data as MarketDataResponse;
          } catch (error) {
            // Return fallback data on network errors
            return {
              value: 0,
              change: 0,
              changePercent: 0,
              timestamp: new Date().toISOString(),
            } as MarketDataResponse;
          }
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'dowjones'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/market-data/dowjones');
            const data = await response.json();
            if (data.error) {
              // Return fallback data instead of throwing
              console.warn('Dow Jones API error:', data.error);
              return {
                value: 0,
                change: 0,
                changePercent: 0,
                timestamp: new Date().toISOString(),
              } as MarketDataResponse;
            }
            return data as MarketDataResponse;
          } catch (error) {
            // Return fallback data on network errors
            console.error('Error fetching Dow Jones:', error);
            return {
              value: 0,
              change: 0,
              changePercent: 0,
              timestamp: new Date().toISOString(),
            } as MarketDataResponse;
          }
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'nasdaq'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/market-data/nasdaq');
            const data = await response.json();
            if (data.error) {
              // Return fallback data instead of throwing
              console.warn('Nasdaq API error:', data.error);
              return {
                value: 0,
                change: 0,
                changePercent: 0,
                timestamp: new Date().toISOString(),
              } as MarketDataResponse;
            }
            return data as MarketDataResponse;
          } catch (error) {
            // Return fallback data on network errors
            console.error('Error fetching Nasdaq:', error);
            return {
              value: 0,
              change: 0,
              changePercent: 0,
              timestamp: new Date().toISOString(),
            } as MarketDataResponse;
          }
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'vix'],
        queryFn: async () => {
          try {
            const response = await fetch('/api/market-data/vix');
            const data = await response.json();
            if (data.error) {
              // Return fallback data instead of throwing
              return {
                value: 0,
                change: 0,
                changePercent: 0,
                timestamp: new Date().toISOString(),
              } as MarketDataResponse;
            }
            return data as MarketDataResponse;
          } catch (error) {
            // Return fallback data on network errors
            return {
              value: 0,
              change: 0,
              changePercent: 0,
              timestamp: new Date().toISOString(),
            } as MarketDataResponse;
          }
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      // Stock queries
      {
        queryKey: ['market-data', 'stocks', 'GOOGL'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/GOOGL');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('GOOGL API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch GOOGL data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'AMZN'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/AMZN');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('AMZN API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch AMZN data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'AAPL'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/AAPL');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('AAPL API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch AAPL data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'TSLA'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/TSLA');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('TSLA API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch TSLA data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'META'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/META');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('META API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch META data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'MSFT'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/MSFT');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('MSFT API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch MSFT data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'stocks', 'NVDA'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/stocks/NVDA');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('NVDA API error:', data.error || `Status ${response.status}`);
            throw new Error(data.error || `Failed to fetch NVDA data: ${response.status}`);
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      // Crypto queries
      {
        queryKey: ['market-data', 'crypto', 'BTC'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/crypto/BTC');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('BTC API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'crypto', 'ETH'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/crypto/ETH');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('ETH API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'crypto', 'XRP'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/crypto/XRP');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('XRP API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      // Commodities queries
      {
        queryKey: ['market-data', 'commodities', 'GOLD'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/commodities/GOLD');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('GOLD API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'commodities', 'SILVER'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/commodities/SILVER');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('SILVER API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: ['market-data', 'commodities', 'OIL'],
        queryFn: async () => {
          const response = await fetch('/api/market-data/commodities/OIL');
          const data = await response.json();
          if (!response.ok || data.error) {
            console.warn('OIL API error:', data.error || `Status ${response.status}`);
            return createFallback();
          }
          return data as MarketDataResponse;
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
        staleTime: 25000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    ],
  });

  const [
    sp500Query, 
    dowjonesQuery, 
    nasdaqQuery, 
    vixQuery,
    googlQuery,
    amznQuery,
    aaplQuery,
    tslaQuery,
    metaQuery,
    msftQuery,
    nvdaQuery,
    btcQuery,
    ethQuery,
    xrpQuery,
    goldQuery,
    silverQuery,
    oilQuery,
  ] = queries;

  // Combine loading states (check all queries)
  const isLoading = 
    sp500Query.isLoading || 
    dowjonesQuery.isLoading || 
    nasdaqQuery.isLoading || 
    vixQuery.isLoading ||
    googlQuery.isLoading ||
    amznQuery.isLoading ||
    aaplQuery.isLoading ||
    tslaQuery.isLoading ||
    metaQuery.isLoading ||
    msftQuery.isLoading ||
    nvdaQuery.isLoading ||
    btcQuery.isLoading ||
    ethQuery.isLoading ||
    xrpQuery.isLoading ||
    goldQuery.isLoading ||
    silverQuery.isLoading ||
    oilQuery.isLoading;

  // Combine errors - return first error found (only from critical indices)
  const error = sp500Query.error || dowjonesQuery.error || nasdaqQuery.error || vixQuery.error || null;

  // Combine data - always return data (with fallbacks if needed)
  const data: CombinedMarketData = {
    sp500: sp500Query.data || createFallback(),
    dowjones: dowjonesQuery.data || createFallback(),
    nasdaq: nasdaqQuery.data || createFallback(),
    vix: vixQuery.data || createFallback(),
    stocks: {
      alphabet: googlQuery.data || createFallback(),
      amazon: amznQuery.data || createFallback(),
      apple: aaplQuery.data || createFallback(),
      tesla: tslaQuery.data || createFallback(),
      meta: metaQuery.data || createFallback(),
      microsoft: msftQuery.data || createFallback(),
      nvidia: nvdaQuery.data || createFallback(),
    },
    crypto: {
      bitcoin: btcQuery.data || createFallback(),
      ethereum: ethQuery.data || createFallback(),
      xrp: xrpQuery.data || createFallback(),
    },
    commodities: {
      gold: goldQuery.data || createFallback(),
      silver: silverQuery.data || createFallback(),
      oil: oilQuery.data || createFallback(),
    },
  };

  // Refetch function that refetches all queries
  const refetch = () => {
    sp500Query.refetch();
    dowjonesQuery.refetch();
    nasdaqQuery.refetch();
    vixQuery.refetch();
    googlQuery.refetch();
    amznQuery.refetch();
    aaplQuery.refetch();
    tslaQuery.refetch();
    metaQuery.refetch();
    msftQuery.refetch();
    nvdaQuery.refetch();
    btcQuery.refetch();
    ethQuery.refetch();
    xrpQuery.refetch();
    goldQuery.refetch();
    silverQuery.refetch();
    oilQuery.refetch();
  };

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Return type for useCrashRiskScore hook
 */
export interface UseCrashRiskScoreReturn {
  score: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom React hook to calculate crash risk score based on VIX level
 * Uses formula: Math.min(100, (vix * 2.5))
 * 
 * @returns {UseCrashRiskScoreReturn} Object containing crash risk score, loading state, and error
 * 
 * @example
 * ```tsx
 * const { score, isLoading, error } = useCrashRiskScore();
 * 
 * if (isLoading) return <div>Calculating...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return <div>Crash Risk: {score}%</div>;
 * ```
 */
export function useCrashRiskScore(): UseCrashRiskScoreReturn {
  const { data, isLoading, error } = useMarketData();

  // Calculate crash risk score from VIX
  // Formula: Math.min(100, (vix * 2.5))
  // This means:
  // - VIX of 0 = 0% risk
  // - VIX of 20 = 50% risk
  // - VIX of 30 = 75% risk
  // - VIX of 40+ = 100% risk (capped)
  const score = data.vix.value 
    ? Math.min(100, data.vix.value * 2.5)
    : 0;

  return {
    score,
    isLoading,
    error,
  };
}

