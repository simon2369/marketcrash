"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface SimpleLineChartData {
  date: string | Date;
  value: number;
  [key: string]: string | Date | number;
}

export interface SimpleLineChartProps {
  data: SimpleLineChartData[];
  dataKey: string;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    [key: string]: any;
  }>;
  label?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-medium text-foreground">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >{`${entry.name || "Value"}: ${entry.value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function SimpleLineChart({
  data,
  dataKey,
  color = "hsl(var(--primary))",
  strokeWidth = 2,
  showGrid = true,
  showTooltip = true,
  className,
  height = 300,
  xAxisLabel,
  yAxisLabel,
}: SimpleLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Format data to ensure dates are strings
  const formattedData = data.map((item) => ({
    ...item,
    date:
      item.date instanceof Date
        ? item.date.toLocaleDateString()
        : String(item.date),
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const checkReady = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(containerRef.current);
        // Check if container has valid dimensions and is visible
        if (rect.width > 50 && rect.height > 50 && computedStyle.display !== 'none') {
          // Wait one more frame to ensure DOM is fully settled
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsReady(true);
            });
          });
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (checkReady()) {
      return;
    }

    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const tryInit = () => {
      if (checkReady()) {
        if (rafId) cancelAnimationFrame(rafId);
        if (resizeObserver) resizeObserver.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }
    };

    // Use requestAnimationFrame to wait for layout
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        tryInit();
      });
    });

    // Set up ResizeObserver to catch when container gets dimensions
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        tryInit();
      });
      resizeObserver.observe(containerRef.current);
    }

    // Fallback timeout
    timeoutId = setTimeout(() => {
      tryInit();
    }, 200);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("w-full", className)} 
      style={{ 
        minWidth: 0, 
        height: `${height}px`, 
        minHeight: `${height}px`,
        width: '100%',
        position: 'relative',
        display: 'block'
      }}
    >
      {isReady && containerRef.current && (
        <ResponsiveContainer 
          width="100%" 
          height="100%" 
          minWidth={0}
          key="simple-chart-ready"
        >
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
          )}
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fill: "currentColor" }}
            label={
              xAxisLabel
                ? {
                    value: xAxisLabel,
                    position: "insideBottom",
                    offset: -5,
                    className: "text-xs fill-muted-foreground",
                  }
                : undefined
            }
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: "currentColor" }}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    className: "text-xs fill-muted-foreground",
                  }
                : undefined
            }
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      )}
      {!isReady && (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      )}
    </div>
  );
}




