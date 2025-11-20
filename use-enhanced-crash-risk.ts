import { useMemo } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { useEconomicIndicators } from '@/hooks/use-economic-indicators';
import { calculateEnhancedCrashRisk, CrashRiskBreakdown } from '@/lib/enhanced-crash-risk';

/**
 * Return type for useEnhancedCrashRiskScore hook
 */
export interface UseEnhancedCrashRiskScoreReturn {
  breakdown: CrashRiskBreakdown;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom React hook to calculate enhanced crash risk score
 * Uses 6 Tier 1 indicators: CAPE, Yield Curve, Margin Debt, Credit Spreads, Buffett, VIX
 * 
 * @returns {UseEnhancedCrashRiskScoreReturn} Object containing risk breakdown, loading state, and error
 * 
 * @example
 * ```tsx
 * const { breakdown, isLoading, error } = useEnhancedCrashRiskScore();
 * 
 * if (isLoading) return <div>Calculating...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <div>Crash Risk: {breakdown.totalScore}%</div>
 *     <div>Risk Level: {breakdown.riskLevel}</div>
 *     <div>Critical Warnings: {breakdown.criticalWarnings}</div>
 *   </div>
 * );
 * ```
 */
export function useEnhancedCrashRiskScore(): UseEnhancedCrashRiskScoreReturn {
  const { data: marketData, isLoading: isMarketLoading, error: marketError } = useMarketData();
  const { data: economicIndicators, isLoading: isEconomicLoading, error: economicError } = useEconomicIndicators();

  // Calculate crash risk score
  const breakdown = useMemo(() => {
    return calculateEnhancedCrashRisk(economicIndicators, marketData);
  }, [economicIndicators, marketData]);

  return {
    breakdown,
    isLoading: isMarketLoading || isEconomicLoading,
    error: (marketError || economicError) as Error | null,
  };
}

/**
 * Legacy hook for backwards compatibility
 * Returns just the total score like the old implementation
 */
export function useCrashRiskScore() {
  const { breakdown, isLoading, error } = useEnhancedCrashRiskScore();

  return {
    score: breakdown.totalScore,
    isLoading,
    error,
  };
}
