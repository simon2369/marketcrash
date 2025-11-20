'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (gcTime in v5, cacheTime in v4)
            refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (not 30 seconds!)
            refetchOnWindowFocus: false, // Don't refetch on tab switch
            retry: 2, // Retry failed requests twice
          },
        },
      })
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}

