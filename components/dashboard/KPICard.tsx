import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: number;
  changePercent?: number;
  unit?: string;
  thresholds?: {
    low: number;
    high: number;
  };
  description?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  changePercent,
  unit = "",
  thresholds = { low: 20, high: 40 },
  description,
  className,
}: KPICardProps) {
  const getColorClass = (val: number) => {
    if (val < thresholds.low) {
      return {
        text: "text-green-600 dark:text-green-400",
        badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      };
    }
    if (val < thresholds.high) {
      return {
        text: "text-yellow-600 dark:text-yellow-400",
        badge: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      };
    }
    return {
      text: "text-red-600 dark:text-red-400",
      badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    };
  };

  const getStatusLabel = (val: number) => {
    if (val < thresholds.low) return "Low";
    if (val < thresholds.high) return "Moderate";
    return "High";
  };

  const colorClasses = getColorClass(value);
  const statusLabel = getStatusLabel(value);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className={colorClasses.badge}>
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={cn("text-2xl font-bold", colorClasses.text)}>
            {value.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 2,
            })}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </div>
          {changePercent !== undefined && (
            <div
              className={cn(
                "text-sm font-medium",
                changePercent >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </div>
          )}
        </div>
        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}




