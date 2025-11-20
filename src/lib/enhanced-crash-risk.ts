/**
 * Enhanced Crash Risk Score Calculator
 * 
 * Uses 6 Tier 1 indicators from historical crash analysis:
 * 1. CAPE Ratio (Shiller P/E)
 * 2. Yield Curve Spread
 * 3. Margin Debt / GDP
 * 4. Credit Spreads (High Yield)
 * 5. Buffett Indicator (Market Cap / GDP)
 * 6. VIX (Volatility Index)
 * 
 * Each indicator is normalized to 0-100 scale and weighted based on
 * historical predictive power from 1929 and 2008 crashes.
 */

import { CombinedEconomicIndicators } from '@/hooks/use-economic-indicators';
import { CombinedMarketData } from '@/hooks/use-market-data';

export interface CrashRiskBreakdown {
  totalScore: number;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
  components: {
    cape: number;
    yieldCurve: number;
    marginDebt: number;
    creditSpreads: number;
    buffett: number;
    vix: number;
  };
  weights: {
    cape: number;
    yieldCurve: number;
    marginDebt: number;
    creditSpreads: number;
    buffett: number;
    vix: number;
  };
  activeWarnings: number;
  criticalWarnings: number;
}

/**
 * Indicator weights based on historical predictive power
 * Total must equal 1.0
 */
const WEIGHTS = {
  cape: 0.20,        // 20% - Most reliable long-term indicator
  yieldCurve: 0.20,  // 20% - Perfect recession predictor
  marginDebt: 0.15,  // 15% - Strong crash amplifier
  creditSpreads: 0.15, // 15% - Leading indicator
  buffett: 0.15,     // 15% - Warren Buffett's favorite
  vix: 0.15,         // 15% - Short-term volatility/fear gauge
};

/**
 * Calculate individual indicator scores (0-100)
 */

function calculateCAPEScore(value: number): number {
  // CAPE Thresholds:
  // Safe: < 20 → 0-20 points
  // Normal: 20-25 → 20-40 points
  // Warning: 25-30 → 40-70 points
  // Danger: > 30 → 70-100 points
  
  if (value <= 20) {
    return (value / 20) * 20; // 0-20 points
  } else if (value <= 25) {
    return 20 + ((value - 20) / 5) * 20; // 20-40 points
  } else if (value <= 30) {
    return 40 + ((value - 25) / 5) * 30; // 40-70 points
  } else {
    // Above 30 is danger zone
    const excessScore = Math.min((value - 30) / 20, 1) * 30;
    return 70 + excessScore; // 70-100 points
  }
}

function calculateYieldCurveScore(value: number): number {
  // Yield Curve Thresholds (10Y - 3M):
  // Healthy: > 2% → 0-10 points
  // Normal: 1-2% → 10-20 points
  // Narrowing: 0.5-1% → 20-50 points
  // Warning: 0-0.5% → 50-70 points
  // Inverted: < 0% → 70-100 points
  
  if (value > 2) {
    return Math.max(0, 10 - (value - 2) * 2); // Very healthy → lower score
  } else if (value > 1) {
    return 10 + ((2 - value) / 1) * 10; // 10-20 points
  } else if (value > 0.5) {
    return 20 + ((1 - value) / 0.5) * 30; // 20-50 points
  } else if (value >= 0) {
    return 50 + ((0.5 - value) / 0.5) * 20; // 50-70 points
  } else {
    // Inverted (negative)
    const inversionDepth = Math.min(Math.abs(value) / 1, 1);
    return 70 + inversionDepth * 30; // 70-100 points
  }
}

function calculateMarginDebtScore(value: number): number {
  // Margin Debt / GDP Thresholds:
  // Safe: < 1.5% → 0-20 points
  // Normal: 1.5-2.5% → 20-40 points
  // Warning: 2.5-3.0% → 40-70 points
  // Danger: > 3.0% → 70-100 points
  
  if (value < 1.5) {
    return (value / 1.5) * 20; // 0-20 points
  } else if (value <= 2.5) {
    return 20 + ((value - 1.5) / 1) * 20; // 20-40 points
  } else if (value <= 3.0) {
    return 40 + ((value - 2.5) / 0.5) * 30; // 40-70 points
  } else {
    // Above 3.0% is extreme
    const excessScore = Math.min((value - 3.0) / 2, 1) * 30;
    return 70 + excessScore; // 70-100 points
  }
}

function calculateCreditSpreadsScore(value: number): number {
  // Credit Spreads (High Yield) Thresholds:
  // Safe: < 3% → 0-20 points
  // Normal: 3-5% → 20-40 points
  // Elevated: 5-7% → 40-70 points
  // Danger: > 7% → 70-100 points
  
  if (value < 3) {
    return (value / 3) * 20; // 0-20 points
  } else if (value <= 5) {
    return 20 + ((value - 3) / 2) * 20; // 20-40 points
  } else if (value <= 7) {
    return 40 + ((value - 5) / 2) * 30; // 40-70 points
  } else {
    // Above 7% signals stress
    const stressScore = Math.min((value - 7) / 5, 1) * 30;
    return 70 + stressScore; // 70-100 points
  }
}

function calculateBuffettScore(value: number): number {
  // Buffett Indicator (Market Cap / GDP) Thresholds:
  // Undervalued: < 80% → 0-10 points
  // Fair: 80-115% → 10-30 points
  // Warning: 115-160% → 30-70 points
  // Danger: > 160% → 70-100 points
  
  if (value < 80) {
    return (value / 80) * 10; // 0-10 points
  } else if (value <= 115) {
    return 10 + ((value - 80) / 35) * 20; // 10-30 points
  } else if (value <= 160) {
    return 30 + ((value - 115) / 45) * 40; // 30-70 points
  } else {
    // Above 160% is danger (Buffett's "playing with fire")
    const excessScore = Math.min((value - 160) / 80, 1) * 30;
    return 70 + excessScore; // 70-100 points
  }
}

function calculateVIXScore(value: number): number {
  // VIX Thresholds:
  // Low volatility: < 15 → 0-20 points
  // Normal: 15-20 → 20-40 points
  // Elevated: 20-30 → 40-70 points
  // High: > 30 → 70-100 points
  
  if (value < 15) {
    return (value / 15) * 20; // 0-20 points
  } else if (value <= 20) {
    return 20 + ((value - 15) / 5) * 20; // 20-40 points
  } else if (value <= 30) {
    return 40 + ((value - 20) / 10) * 30; // 40-70 points
  } else {
    // VIX > 30 signals fear/panic
    const panicScore = Math.min((value - 30) / 20, 1) * 30;
    return 70 + panicScore; // 70-100 points, capped at 100
  }
}

/**
 * Main function to calculate comprehensive crash risk score
 */
export function calculateEnhancedCrashRisk(
  economicIndicators: CombinedEconomicIndicators | undefined,
  marketData: CombinedMarketData | undefined
): CrashRiskBreakdown {
  // Calculate individual scores
  const scores = {
    cape: economicIndicators?.cape?.value 
      ? calculateCAPEScore(economicIndicators.cape.value)
      : 0,
    yieldCurve: economicIndicators?.yieldCurve?.value !== undefined
      ? calculateYieldCurveScore(economicIndicators.yieldCurve.value)
      : 0,
    marginDebt: economicIndicators?.marginDebt?.value
      ? calculateMarginDebtScore(economicIndicators.marginDebt.value)
      : 0,
    creditSpreads: economicIndicators?.creditSpreads?.value
      ? calculateCreditSpreadsScore(economicIndicators.creditSpreads.value)
      : 0,
    buffett: economicIndicators?.buffett?.value
      ? calculateBuffettScore(economicIndicators.buffett.value)
      : 0,
    vix: marketData?.vix?.value
      ? calculateVIXScore(marketData.vix.value)
      : 0,
  };

  // Calculate weighted total score
  const totalScore = Math.min(
    100,
    scores.cape * WEIGHTS.cape +
    scores.yieldCurve * WEIGHTS.yieldCurve +
    scores.marginDebt * WEIGHTS.marginDebt +
    scores.creditSpreads * WEIGHTS.creditSpreads +
    scores.buffett * WEIGHTS.buffett +
    scores.vix * WEIGHTS.vix
  );

  // Determine risk level
  let riskLevel: CrashRiskBreakdown['riskLevel'];
  if (totalScore < 30) {
    riskLevel = 'Low';
  } else if (totalScore < 50) {
    riskLevel = 'Moderate';
  } else if (totalScore < 65) {
    riskLevel = 'Elevated';
  } else if (totalScore < 80) {
    riskLevel = 'High';
  } else {
    riskLevel = 'Critical';
  }

  // Count warnings
  const activeWarnings = Object.values(scores).filter(s => s >= 40 && s < 70).length;
  const criticalWarnings = Object.values(scores).filter(s => s >= 70).length;

  return {
    totalScore: Math.round(totalScore),
    riskLevel,
    components: scores,
    weights: WEIGHTS,
    activeWarnings,
    criticalWarnings,
  };
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(riskLevel: CrashRiskBreakdown['riskLevel']): string {
  switch (riskLevel) {
    case 'Low':
      return 'text-green-400 bg-green-500/10 border-green-500/50';
    case 'Moderate':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/50';
    case 'Elevated':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50';
    case 'High':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/50';
    case 'Critical':
      return 'text-red-400 bg-red-500/10 border-red-500/50';
  }
}

/**
 * Get risk level emoji
 */
export function getRiskLevelEmoji(riskLevel: CrashRiskBreakdown['riskLevel']): string {
  switch (riskLevel) {
    case 'Low':
      return '✅';
    case 'Moderate':
      return '🔵';
    case 'Elevated':
      return '⚠️';
    case 'High':
      return '🔶';
    case 'Critical':
      return '🚨';
  }
}
