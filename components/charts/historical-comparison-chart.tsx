'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
  ReferenceLine,
} from 'recharts';
import { crashData } from '@/lib/data/historicalCrashes';
import { format, parse, differenceInMonths } from 'date-fns';

/**
 * Transformed data point for chart
 */
interface ChartDataPoint {
  monthsFromPeak: number;
  crash1929?: number;
  crash2008?: number;
  current2025?: number;
  event1929?: string;
  event2008?: string;
  event2025?: string;
}

/**
 * Transformed point from crash timeline
 */
interface TransformedPoint {
  monthsFromPeak: number;
  value: number;
  event: string;
}

/**
 * Transform crash data to months from peak
 */
function transformCrashData(
  crashTimeline: Array<{ date: string; value: number; event: string }>
): TransformedPoint[] {
  if (crashTimeline.length === 0) return [];

  // Parse peak date
  const peakDate = parse(crashTimeline[0].date, 'yyyy-MM', new Date());
  const peakValue = crashTimeline[0].value;

  return crashTimeline.map((point) => {
    const pointDate = parse(point.date, 'yyyy-MM', new Date());
    const monthsFromPeak = differenceInMonths(pointDate, peakDate);
    const normalizedValue = (point.value / peakValue) * 100;

    return {
      monthsFromPeak,
      value: normalizedValue,
      event: point.event,
    };
  });
}

/**
 * Merge all crash timelines into a single dataset
 */
function mergeCrashData(): ChartDataPoint[] {
  const data1929 = transformCrashData(crashData.crash1929);
  const data2008 = transformCrashData(crashData.crash2008);
  const data2025 = transformCrashData(crashData.current2025);

  // Create a map to merge data by monthsFromPeak
  const mergedMap = new Map<number, ChartDataPoint>();

  // Add 1929 data
  data1929.forEach((point) => {
    mergedMap.set(point.monthsFromPeak, {
      monthsFromPeak: point.monthsFromPeak,
      crash1929: point.value,
      event1929: point.event,
    });
  });

  // Add 2008 data
  data2008.forEach((point) => {
    const existing = mergedMap.get(point.monthsFromPeak) || {
      monthsFromPeak: point.monthsFromPeak,
    };
    mergedMap.set(point.monthsFromPeak, {
      ...existing,
      crash2008: point.value,
      event2008: point.event,
    });
  });

  // Add 2025 data
  data2025.forEach((point) => {
    const existing = mergedMap.get(point.monthsFromPeak) || {
      monthsFromPeak: point.monthsFromPeak,
    };
    mergedMap.set(point.monthsFromPeak, {
      ...existing,
      current2025: point.value,
      event2025: point.event,
    });
  });

  // Convert to array and sort by monthsFromPeak
  return Array.from(mergedMap.values()).sort(
    (a, b) => a.monthsFromPeak - b.monthsFromPeak
  );
}

/**
 * Custom dot component for events
 */
function EventDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  // Show dot if there's an event for this data point
  const hasEvent =
    payload.event1929 || payload.event2008 || payload.event2025;

  if (!hasEvent) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill="#fff"
      stroke="#94a3b8"
      strokeWidth={2}
    />
  );
}

/**
 * Custom tooltip
 */
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-lg">
        <p className="mb-2 text-sm font-semibold text-white">
          Month {data.monthsFromPeak}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(1)}%
          </p>
        ))}
        {data.event1929 && (
          <p className="mt-2 text-xs text-red-400">1929: {data.event1929}</p>
        )}
        {data.event2008 && (
          <p className="mt-1 text-xs text-orange-400">2008: {data.event2008}</p>
        )}
        {data.event2025 && (
          <p className="mt-1 text-xs text-yellow-400">
            2025: {data.event2025}
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * Historical Comparison Chart Component
 * Compares 1929, 2008, and 2025 projected crashes
 */
export function HistoricalComparisonChart() {
  const chartData = mergeCrashData();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Historical Crash Comparison
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Market performance from peak: 1929 vs 2008 vs 2025 (projected)
          </p>
        </div>
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-slate-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          Historical Crash Comparison
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Market performance from peak: 1929 vs 2008 vs 2025 (projected)
        </p>
      </div>
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.3}
            />
            <XAxis
              dataKey="monthsFromPeak"
              label={{
                value: 'Months from Peak',
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#94a3b8', fontSize: 12 },
              }}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 18]}
            />
            <YAxis
              label={{
                value: '% of Peak Value',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#94a3b8', fontSize: 12 },
              }}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => (
                <span className="text-slate-300 text-sm">{value}</span>
              )}
            />
            {/* Reference line at 50% */}
            <ReferenceLine
              y={50}
              stroke="#64748b"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: '50%', position: 'right', fill: '#64748b' }}
            />
            {/* 1929 Crash - Red */}
            <Line
              type="monotone"
              dataKey="crash1929"
              name="1929 Crash"
              stroke="#ef4444"
              strokeWidth={3}
              dot={<EventDot />}
              activeDot={{ r: 6, fill: '#ef4444' }}
              connectNulls={false}
            />
            {/* 2008 Crash - Orange */}
            <Line
              type="monotone"
              dataKey="crash2008"
              name="2008 Crash"
              stroke="#f97316"
              strokeWidth={3}
              dot={<EventDot />}
              activeDot={{ r: 6, fill: '#f97316' }}
              connectNulls={false}
            />
            {/* 2025 Projected - Yellow */}
            <Line
              type="monotone"
              dataKey="current2025"
              name="2025 Projected"
              stroke="#eab308"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={<EventDot />}
              activeDot={{ r: 6, fill: '#eab308' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>1929: 89% loss over 42 months</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span>2008: 53% loss over 17 months</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>2025: Projected based on 1929 pattern</span>
        </div>
      </div>
    </div>
  );
}

