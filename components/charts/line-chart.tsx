'use client';

import { useState, useEffect } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MarketData } from '@/lib/types';
import { format } from 'date-fns';

export interface LineChartDataPoint {
  timestamp: Date | string;
  value: number;
  [key: string]: unknown;
}

export interface LineChartProps {
  data: LineChartDataPoint[] | MarketData[];
  color?: string;
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  strokeWidth?: number;
  className?: string;
}

/**
 * Custom tooltip component for the line chart
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ 
    value: number; 
    name: string; 
    color: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload || {};
    const value = payload[0].value;
    const date = label ? new Date(String(label)) : new Date();

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-medium text-muted-foreground">
          {format(date, 'MMM dd, yyyy HH:mm')}
        </p>
        <p className="text-lg font-bold">
          {typeof value === 'number' 
            ? value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : value}
        </p>
        {data.volume && typeof data.volume === 'number' && (
          <p className="text-xs text-muted-foreground">
            Volume: {data.volume.toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * Format timestamp for X-axis
 */
function formatXAxisLabel(tickItem: Date | string | number): string {
  if (typeof tickItem === 'number') {
    return format(new Date(tickItem), 'MMM dd');
  }
  const date = typeof tickItem === 'string' ? new Date(tickItem) : tickItem;
  return format(date, 'MMM dd');
}

/**
 * Line Chart Component
 * Displays market data or time series data as a line chart
 */
export function LineChart({
  data,
  color = 'hsl(var(--primary))',
  dataKey = 'price',
  xAxisKey = 'timestamp',
  height = 300,
  showGrid = true,
  showTooltip = true,
  strokeWidth = 2,
  className,
}: LineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Transform data to ensure consistent format
  const chartData = data.map((item) => {
    // If it's MarketData, use price as value
    if ('price' in item) {
      return {
        ...item,
        value: item.price,
        timestamp: item.timestamp,
      };
    }
    // Otherwise use the provided dataKey
    return {
      ...item,
      value: item[dataKey] as number,
      timestamp: item[xAxisKey] as Date | string,
    };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={className} style={{ width: '100%', height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxisLabel}
            className="text-xs text-muted-foreground"
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`;
              }
              if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}K`;
              }
              return value.toLocaleString();
            }}
            className="text-xs text-muted-foreground"
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

