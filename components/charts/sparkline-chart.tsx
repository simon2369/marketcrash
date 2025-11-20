'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Data point for sparkline chart
 */
export interface SparklineDataPoint {
  date: string | Date;
  value: number;
}

/**
 * Props for SparklineChart component
 */
export interface SparklineChartProps {
  data: SparklineDataPoint[];
  color?: string;
  className?: string;
  showArea?: boolean;
}

/**
 * Custom tooltip for sparkline (minimal, only shows value)
 */
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded bg-slate-800 border border-slate-700 px-2 py-1 shadow-lg">
        <p className="text-xs text-white font-medium">
          {typeof payload[0].value === 'number'
            ? payload[0].value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Sparkline Chart Component
 * A compact, minimal line chart for displaying trends
 */
export function SparklineChart({
  data,
  color = '#3b82f6',
  className,
  showArea = true,
}: SparklineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure data is sorted by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Calculate gradient ID for area fill
  const gradientId = `sparkline-gradient-${color.replace('#', '')}`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (sortedData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-[60px] bg-slate-800/30 rounded ${className || ''}`}
      >
        <p className="text-xs text-slate-500">No data</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className={`w-full h-[60px] ${className || ''}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xs text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-[60px] ${className || ''}`}>
      <ResponsiveContainer width="100%" height={60}>
        {showArea ? (
          <AreaChart
            data={sortedData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </AreaChart>
        ) : (
          <LineChart
            data={sortedData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

