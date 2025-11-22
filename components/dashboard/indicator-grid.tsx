'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useEconomicIndicators } from '@/hooks/use-economic-indicators';
import { SparklineChart, SparklineDataPoint } from '@/components/charts/sparkline-chart';

/**
 * Indicator status type
 */
export type IndicatorStatus = 'safe' | 'warning' | 'danger';

/**
 * Trend direction type
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Indicator data structure
 */
export interface Indicator {
  id: string;
  name: string;
  currentValue: number;
  unit: string;
  warningThreshold: number;
  dangerThreshold: number;
  historicalAverage?: number;
  normalRange?: string;
  status: IndicatorStatus;
  trend: TrendDirection;
  description?: string;
  invertThresholds?: boolean; // If true, lower values are worse
}

/**
 * Get status based on value and thresholds
 */
function getStatus(
  value: number,
  warningThreshold: number,
  dangerThreshold: number,
  invertThresholds: boolean = false
): IndicatorStatus {
  if (invertThresholds) {
    if (value <= dangerThreshold) return 'danger';
    if (value <= warningThreshold) return 'warning';
    return 'safe';
  } else {
    if (value >= dangerThreshold) return 'danger';
    if (value >= warningThreshold) return 'warning';
    return 'safe';
  }
}

/**
 * Get status badge variant and color
 */
function getStatusBadge(status: IndicatorStatus) {
  switch (status) {
    case 'danger':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500 text-white border-red-600',
        label: 'DANGER',
      };
    case 'warning':
      return {
        variant: 'outline' as const,
        className: 'bg-yellow-500 text-white border-yellow-600',
        label: 'WARNING',
      };
    case 'safe':
      return {
        variant: 'outline' as const,
        className: 'bg-green-500 text-white border-green-600',
        label: 'SAFE',
      };
  }
}

/**
 * Get trend arrow icon
 */
function TrendArrow({ direction }: { direction: TrendDirection }) {
  const arrowMap = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const colorMap = {
    up: 'text-red-400',
    down: 'text-green-400',
    neutral: 'text-slate-400',
  };

  return (
    <span className={cn('text-sm font-bold', colorMap[direction])}>
      {arrowMap[direction]}
    </span>
  );
}

/**
 * Format value based on unit
 */
function formatValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'x' || unit === 'ratio') {
    return value.toFixed(1);
  }
  return `${value.toFixed(2)}${unit}`;
}

/**
 * Generate mock 12-month historical data showing trend rising into danger zones
 */
function generateHistoricalData(
  indicatorId: string,
  currentValue: number,
  historicalAvg?: number
): SparklineDataPoint[] {
  const months = 12;
  const data: SparklineDataPoint[] = [];
  const now = new Date();

  // Generate dates for last 12 months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    data.push({ date: date.toISOString().slice(0, 7), value: 0 });
  }

  // Calculate trend based on indicator type
  switch (indicatorId) {
    case 'cape':
      // Start around historical avg (16.8), rise to current (39.2)
      const capeStart = historicalAvg || 16.8;
      data.forEach((point, i) => {
        const progress = i / (months - 1);
        point.value = capeStart + (currentValue - capeStart) * progress;
      });
      break;

    case 'yield-curve':
      // Start positive, decline to negative (inverted)
      const yieldStart = 1.5;
      data.forEach((point, i) => {
        const progress = i / (months - 1);
        point.value = yieldStart - (yieldStart - currentValue) * progress;
      });
      break;

    case 'margin-debt':
      // Start around historical avg (1.8), rise to current (3.8)
      const marginStart = historicalAvg || 1.8;
      data.forEach((point, i) => {
        const progress = i / (months - 1);
        point.value = marginStart + (currentValue - marginStart) * progress;
      });
      break;

    case 'credit-spreads':
      // Start lower, rise to current
      const creditStart = 3.0;
      data.forEach((point, i) => {
        const progress = i / (months - 1);
        point.value = creditStart + (currentValue - creditStart) * progress;
      });
      break;

    case 'buffett':
      // Start around historical avg (80), rise dramatically to current (228)
      const buffettStart = historicalAvg || 80;
      data.forEach((point, i) => {
        const progress = i / (months - 1);
        // Exponential growth curve for dramatic rise
        const exponentialProgress = Math.pow(progress, 0.7);
        point.value = buffettStart + (currentValue - buffettStart) * exponentialProgress;
      });
      break;

    default:
      // Default linear trend
      data.forEach((point, i) => {
        point.value = currentValue * (0.7 + (i / (months - 1)) * 0.3);
      });
  }

  return data;
}

/**
 * Get chart color based on indicator status
 */
function getChartColor(status: IndicatorStatus): string {
  switch (status) {
    case 'danger':
      return '#ef4444'; // red-500
    case 'warning':
      return '#eab308'; // yellow-500
    case 'safe':
      return '#22c55e'; // green-500
  }
}

/**
 * Indicator Card Component
 */
function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const statusBadge = getStatusBadge(indicator.status);
  const historicalData = generateHistoricalData(
    indicator.id,
    indicator.currentValue,
    indicator.historicalAverage
  );
  const chartColor = getChartColor(indicator.status);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-slate-300">
            {indicator.name}
          </CardTitle>
          <Badge
            variant={statusBadge.variant}
            className={cn('text-xs font-semibold', statusBadge.className)}
          >
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {formatValue(indicator.currentValue, indicator.unit)}
          </span>
          <TrendArrow direction={indicator.trend} />
        </div>

        {indicator.description && (
          <p className={cn(
            "text-xs",
            indicator.id === 'yield-curve' && indicator.currentValue < 0
              ? "text-red-400 font-semibold"
              : indicator.id === 'buffett' && indicator.currentValue > 200
              ? "text-red-400 font-semibold"
              : "text-slate-400"
          )}>
            {indicator.description}
            {indicator.id === 'yield-curve' && indicator.currentValue < 0 && ' - INVERTED'}
            {indicator.id === 'buffett' && indicator.currentValue > 200 && ' - EXTREME'}
          </p>
        )}

        <div className="space-y-1 text-xs text-slate-500">
          {indicator.historicalAverage !== undefined && (
            <div>
              Historical avg: <span className="text-slate-400">{formatValue(indicator.historicalAverage, indicator.unit)}</span>
            </div>
          )}
          {indicator.normalRange && (
            <div>
              Normal range: <span className="text-slate-400">{indicator.normalRange}</span>
            </div>
          )}
          <div>
            {indicator.invertThresholds ? (
              <>
                Warning: <span className="text-yellow-400">≤{formatValue(indicator.warningThreshold, indicator.unit)}</span>
                {' | '}
                Danger: <span className="text-red-400">≤{formatValue(indicator.dangerThreshold, indicator.unit)}</span>
              </>
            ) : (
              <>
                Warning: <span className="text-yellow-400">≥{formatValue(indicator.warningThreshold, indicator.unit)}</span>
                {' | '}
                Danger: <span className="text-red-400">≥{formatValue(indicator.dangerThreshold, indicator.unit)}</span>
              </>
            )}
          </div>
        </div>

        {/* 12-Month Trend Sparkline */}
        <div className="pt-2 border-t border-slate-700">
          <SparklineChart
            data={historicalData}
            color={chartColor}
            showArea={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Indicator Grid Component
 * Displays Tier 1 crash indicators in a responsive grid
 */
export function IndicatorGrid() {
  // Fetch real economic indicator data
  const { data, isLoading, error } = useEconomicIndicators();

  // Map API data to Indicator format
  const indicators: Indicator[] = data
    ? [
        {
          id: 'cape',
          name: 'CAPE Ratio',
          currentValue: data.cape.value,
          unit: 'x',
          warningThreshold: data.cape.warningLevel,
          dangerThreshold: data.cape.dangerLevel,
          historicalAverage: data.cape.historicalAvg,
          status: data.cape.status,
          trend: data.cape.value > data.cape.historicalAvg ? 'up' : 'down',
          description: data.cape.description,
        },
        {
          id: 'yield-curve',
          name: 'Yield Curve',
          currentValue: data.yieldCurve.value,
          unit: '%',
          warningThreshold: data.yieldCurve.warningLevel,
          dangerThreshold: data.yieldCurve.dangerLevel,
          historicalAverage: data.yieldCurve.historicalAvg,
          normalRange: undefined,
          status: data.yieldCurve.status,
          trend: data.yieldCurve.value < 0 ? 'down' : data.yieldCurve.value < data.yieldCurve.historicalAvg ? 'down' : 'up',
          description: data.yieldCurve.description,
          invertThresholds: true,
        },
        {
          id: 'margin-debt',
          name: 'Margin Debt / GDP',
          currentValue: data.marginDebt.value,
          unit: '%',
          warningThreshold: data.marginDebt.warningLevel,
          dangerThreshold: data.marginDebt.dangerLevel,
          historicalAverage: data.marginDebt.historicalAvg,
          status: data.marginDebt.status,
          trend: data.marginDebt.value > data.marginDebt.historicalAvg ? 'up' : 'down',
          description: data.marginDebt.description,
        },
        {
          id: 'credit-spreads',
          name: 'Credit Spreads',
          currentValue: data.creditSpreads.value,
          unit: '%',
          warningThreshold: data.creditSpreads.warningLevel,
          dangerThreshold: data.creditSpreads.dangerLevel,
          historicalAverage: data.creditSpreads.historicalAvg,
          normalRange: '3-5%',
          status: data.creditSpreads.status,
          trend: data.creditSpreads.value > data.creditSpreads.historicalAvg ? 'up' : data.creditSpreads.value < data.creditSpreads.historicalAvg ? 'down' : 'neutral',
          description: data.creditSpreads.description,
        },
        {
          id: 'buffett',
          name: 'Buffett Indicator',
          currentValue: data.buffett.value,
          unit: '%',
          warningThreshold: data.buffett.warningLevel,
          dangerThreshold: data.buffett.dangerLevel,
          historicalAverage: data.buffett.historicalAvg,
          status: data.buffett.status,
          trend: data.buffett.value > data.buffett.historicalAvg ? 'up' : 'down',
          description: data.buffett.description,
        },
      ]
    : [];

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">Tier 1 Crash Indicators</h2>
          <p className="mt-1 text-sm text-slate-400">
            Key metrics that historically signal market crashes
          </p>
        </div>
        
        {/* Subscribe Button */}
        <Link
          href="/newsletter#subscription-form"
          className="group flex-shrink-0"
        >
          <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 rounded-lg border border-slate-500/50 p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[240px] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                <span className="text-xl">🚨</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm leading-tight mb-1">
                  Subscribe to Real-time Alerts
                </div>
                <div className="text-slate-300 text-xs leading-tight">
                  Instant notifications when crash indicators are triggered
                </div>
              </div>
              <div className="flex-shrink-0 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-red-400">
            Error loading economic indicators: {error.message}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : indicators.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

