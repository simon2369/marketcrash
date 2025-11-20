"use client";

import { useQuery } from "@tanstack/react-query";
import { getMarketData } from "@/lib/api/marketData";
import type { SP500Data, VIXData, MarketData } from "@/lib/types";

const REFETCH_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Custom hook to fetch S&P 500 market data
 */
export function useSP500Data() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SP500Data, Error>({
    queryKey: ["sp500"],
    queryFn: async () => {
      const response = await fetch("/api/market-data/sp500");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch S&P 500 data");
      }
      return response.json();
    },
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: REFETCH_INTERVAL,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Custom hook to fetch VIX (Volatility Index) data
 */
export function useVIXData() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<VIXData, Error>({
    queryKey: ["vix"],
    queryFn: async () => {
      const response = await fetch("/api/market-data/vix");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch VIX data");
      }
      return response.json();
    },
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: REFETCH_INTERVAL,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Custom hook to fetch market data for a specific symbol
 */
export function useMarketData(symbol: string, enabled: boolean = true) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<MarketData, Error>({
    queryKey: ["market-data", symbol],
    queryFn: () => getMarketData(symbol),
    enabled: enabled && !!symbol,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: REFETCH_INTERVAL,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Combined hook to fetch both S&P 500 and VIX data
 */
export function useMarketOverview() {
  const sp500 = useSP500Data();
  const vix = useVIXData();

  return {
    sp500: {
      data: sp500.data,
      isLoading: sp500.isLoading,
      error: sp500.error,
    },
    vix: {
      data: vix.data,
      isLoading: vix.isLoading,
      error: vix.error,
    },
    isLoading: sp500.isLoading || vix.isLoading,
    error: sp500.error || vix.error,
  };
}

