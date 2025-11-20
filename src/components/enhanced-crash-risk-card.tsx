'use client';

import { useEnhancedCrashRiskScore } from '@/src/hooks/use-enhanced-crash-risk';
import { getRiskLevelColor, getRiskLevelEmoji } from '@/src/lib/enhanced-crash-risk';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export function EnhancedCrashRiskCard() {
  const { breakdown, isLoading, error } = useEnhancedCrashRiskScore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <p className="text-sm text-red-400">
          Error calculating crash risk: {error.message}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-12 w-40 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const colorClass = getRiskLevelColor(breakdown.riskLevel);
  const emoji = getRiskLevelEmoji(breakdown.riskLevel);

  return (
    <div className={`rounded-lg border p-6 backdrop-blur-sm ${colorClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">
            Crash Risk Score
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {breakdown.totalScore}%
            </span>
            <span className="text-xl">{emoji}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">Risk Level</div>
          <div className="text-lg font-bold">{breakdown.riskLevel}</div>
        </div>
      </div>

      {/* Warning Counters */}
      <div className="flex gap-4 mb-4 text-sm">
        {breakdown.criticalWarnings > 0 && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{breakdown.criticalWarnings} Critical</span>
          </div>
        )}
        {breakdown.activeWarnings > 0 && (
          <div className="flex items-center gap-1 text-yellow-400">
            <TrendingUp className="h-4 w-4" />
            <span>{breakdown.activeWarnings} Warning</span>
          </div>
        )}
        {breakdown.criticalWarnings === 0 && breakdown.activeWarnings === 0 && (
          <div className="flex items-center gap-1 text-green-400">
            <Info className="h-4 w-4" />
            <span>All indicators normal</span>
          </div>
        )}
      </div>

      {/* Toggle Breakdown Button */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors py-2 border-t border-slate-700"
      >
        {showBreakdown ? '▼ Hide Breakdown' : '▶ Show Breakdown'}
      </button>

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
          {/* CAPE Ratio */}
          <IndicatorRow
            name="CAPE Ratio"
            score={breakdown.components.cape}
            weight={breakdown.weights.cape}
          />

          {/* Yield Curve */}
          <IndicatorRow
            name="Yield Curve"
            score={breakdown.components.yieldCurve}
            weight={breakdown.weights.yieldCurve}
          />

          {/* Margin Debt */}
          <IndicatorRow
            name="Margin Debt"
            score={breakdown.components.marginDebt}
            weight={breakdown.weights.marginDebt}
          />

          {/* Credit Spreads */}
          <IndicatorRow
            name="Credit Spreads"
            score={breakdown.components.creditSpreads}
            weight={breakdown.weights.creditSpreads}
          />

          {/* Buffett Indicator */}
          <IndicatorRow
            name="Buffett Indicator"
            score={breakdown.components.buffett}
            weight={breakdown.weights.buffett}
          />

          {/* VIX */}
          <IndicatorRow
            name="VIX"
            score={breakdown.components.vix}
            weight={breakdown.weights.vix}
          />

          {/* Methodology Note */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded text-xs text-slate-400">
            <div className="font-semibold mb-1">📊 Methodology</div>
            <div>
              Each indicator is normalized to 0-100 and weighted based on historical
              crash prediction accuracy. Scores: 0-30 Low, 30-50 Moderate, 50-65 Elevated,
              65-80 High, 80-100 Critical.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual indicator row component
 */
function IndicatorRow({
  name,
  score,
  weight,
}: {
  name: string;
  score: number;
  weight: number;
}) {
  const getScoreColor = (score: number) => {
    if (score < 40) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const contribution = score * weight;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-300">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            {Math.round(score)}/100 × {(weight * 100).toFixed(0)}%
          </span>
          <span className="font-semibold text-white">
            = {contribution.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
