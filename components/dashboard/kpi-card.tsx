import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: number;
  changePercent?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  formatValue?: (value: number) => string;
  unit?: string;
  className?: string;
  invertThresholds?: boolean; // If true, higher values are worse (e.g., VIX)
}

type StatusColor = 'success' | 'warning' | 'critical';

/**
 * Determine status color based on value and thresholds
 */
function getStatusColor(
  value: number,
  changePercent: number | undefined,
  threshold: KPICardProps['threshold'],
  invertThresholds: boolean
): StatusColor {
  if (!threshold) {
    // If no threshold, use change percentage
    // Positive changes = green, negative changes = red
    if (changePercent === undefined) return 'success';
    if (changePercent < 0) {
      // Negative change - use severity based on magnitude
      if (changePercent < -5) return 'critical';
      if (changePercent < -2) return 'warning';
      return 'critical'; // Even small negative changes are red
    }
    // Positive change - always green
    return 'success';
  }

  // Determine if value is critical, warning, or normal
  const isCritical = invertThresholds
    ? value >= threshold.critical
    : value <= threshold.critical;
  const isWarning = invertThresholds
    ? value >= threshold.warning && value < threshold.critical
    : value <= threshold.warning && value > threshold.critical;

  if (isCritical) return 'critical';
  if (isWarning) return 'warning';
  return 'success';
}

/**
 * Format change percentage for display
 */
function formatChangePercent(changePercent: number | undefined): string {
  if (changePercent === undefined || isNaN(changePercent)) return 'N/A';
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
}

/**
 * Get color classes based on status
 */
function getColorClasses(status: StatusColor) {
  switch (status) {
    case 'critical':
      return {
        border: 'border-red-500/50 dark:border-red-500/30',
        badge: 'bg-red-500 text-white border-red-600',
        value: 'text-red-600 dark:text-red-400',
      };
    case 'warning':
      return {
        border: 'border-yellow-500/50 dark:border-yellow-500/30',
        badge: 'bg-yellow-500 text-white border-yellow-600',
        value: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'success':
      return {
        border: 'border-green-500/50 dark:border-green-500/30',
        badge: 'bg-green-500 text-white border-green-600',
        value: 'text-green-600 dark:text-green-400',
      };
  }
}

/**
 * KPI Card Component
 * Displays a key performance indicator with title, value, change percentage, and color coding
 */
export function KPICard({
  title,
  value,
  changePercent,
  threshold,
  formatValue,
  unit,
  className,
  invertThresholds = false,
}: KPICardProps) {
  const status = getStatusColor(value, changePercent, threshold, invertThresholds);
  const colors = getColorClasses(status);
  const formattedValue = formatValue
    ? formatValue(value)
    : value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        colors.border,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {changePercent !== undefined && (
          <Badge
            variant="outline"
            className={cn('text-xs font-semibold', colors.badge)}
          >
            {formatChangePercent(changePercent)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold', colors.value)}>
            {formattedValue}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

