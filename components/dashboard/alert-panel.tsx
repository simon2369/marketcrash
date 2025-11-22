'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CombinedEconomicIndicators } from '@/hooks/use-economic-indicators';
import { format } from 'date-fns';

/**
 * Alert severity type
 */
export type AlertSeverity = 'warning' | 'critical';

/**
 * Alert data structure
 */
export interface Alert {
  id: string;
  indicatorId: string;
  indicatorName: string;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

/**
 * Props for AlertPanel component
 */
export interface AlertPanelProps {
  indicators: CombinedEconomicIndicators | undefined;
  className?: string;
  position?: 'sticky' | 'fixed';
}

/**
 * Get indicator name from ID
 */
function getIndicatorName(indicatorId: string): string {
  const names: Record<string, string> = {
    cape: 'CAPE Ratio',
    yieldCurve: 'Yield Curve',
    marginDebt: 'Margin Debt / GDP',
    creditSpreads: 'Credit Spreads',
    buffett: 'Buffett Indicator',
  };
  return names[indicatorId] || indicatorId;
}

/**
 * Generate alerts from indicators
 */
function generateAlerts(indicators: CombinedEconomicIndicators | undefined): Alert[] {
  if (!indicators) return [];

  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // Check each indicator
  const indicatorMap = [
    { id: 'cape', data: indicators.cape },
    { id: 'yieldCurve', data: indicators.yieldCurve },
    { id: 'marginDebt', data: indicators.marginDebt },
    { id: 'creditSpreads', data: indicators.creditSpreads },
    { id: 'buffett', data: indicators.buffett },
  ];

  indicatorMap.forEach(({ id, data }) => {
    if (data.status === 'danger') {
      alerts.push({
        id: `${id}-critical-${now}`,
        indicatorId: id,
        indicatorName: getIndicatorName(id),
        severity: 'critical',
        message: `${getIndicatorName(id)} is in DANGER zone`,
        value: data.value,
        threshold: data.dangerLevel,
        timestamp: now,
      });
    } else if (data.status === 'warning') {
      alerts.push({
        id: `${id}-warning-${now}`,
        indicatorId: id,
        indicatorName: getIndicatorName(id),
        severity: 'warning',
        message: `${getIndicatorName(id)} is in WARNING zone`,
        value: data.value,
        threshold: data.warningLevel,
        timestamp: now,
      });
    }
  });

  return alerts;
}

/**
 * Get dismissed alert keys from localStorage
 * Uses format: "indicator-severity" (e.g., "cape-critical", "yieldCurve-warning")
 * This persists across alert regenerations since alert IDs include timestamps
 */
function getDismissedAlertKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem('dismissed-alert-keys');
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed);
    }
  } catch (error) {
    console.error('Error reading dismissed alerts from localStorage:', error);
  }
  
  return new Set();
}

/**
 * Save dismissed alert keys to localStorage
 */
function saveDismissedAlertKeys(dismissed: Set<string>) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('dismissed-alert-keys', JSON.stringify(Array.from(dismissed)));
  } catch (error) {
    console.error('Error saving dismissed alerts to localStorage:', error);
  }
}

/**
 * Generate alert key from alert (indicator-severity format)
 * e.g., alert with indicatorId="cape" and severity="critical" -> "cape-critical"
 */
function getAlertKey(alert: Alert): string {
  return `${alert.indicatorId}-${alert.severity}`;
}

/**
 * Alert Panel Component
 * Displays active alerts based on indicator thresholds
 * Compact, collapsible design to minimize dashboard disruption
 */
export function AlertPanel({ indicators, className, position = 'sticky' }: AlertPanelProps) {
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    setDismissedAlertKeys(getDismissedAlertKeys());
  }, []);

  // Generate alerts from indicators
  const allAlerts = useMemo(() => generateAlerts(indicators), [indicators]);

  // Filter out dismissed alerts by checking alert keys (indicator-severity)
  const activeAlerts = useMemo(
    () => allAlerts.filter((alert) => {
      const alertKey = getAlertKey(alert);
      return !dismissedAlertKeys.has(alertKey);
    }),
    [allAlerts, dismissedAlertKeys]
  );

  // Group alerts by severity
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter((alert) => alert.severity === 'warning');

  // Dismiss an alert
  const handleDismiss = (alertId: string) => {
    const alert = allAlerts.find(a => a.id === alertId);
    if (!alert) return;
    
    const alertKey = getAlertKey(alert);
    const newDismissed = new Set([...dismissedAlertKeys, alertKey]);
    setDismissedAlertKeys(newDismissed);
    saveDismissedAlertKeys(newDismissed);
  };

  // Dismiss all alerts
  const handleDismissAll = () => {
    const allAlertKeys = new Set(activeAlerts.map(alert => getAlertKey(alert)));
    const newDismissed = new Set([...dismissedAlertKeys, ...allAlertKeys]);
    setDismissedAlertKeys(newDismissed);
    saveDismissedAlertKeys(newDismissed);
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  const defaultPositionClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-50 max-w-xs' 
    : 'sticky top-4';
  
  // If className is provided, use it instead of default positioning
  const positionClasses = className && className.includes('top') 
    ? '' 
    : defaultPositionClasses;

  // Minimized view - just a compact badge/button
  if (isMinimized) {
    return (
      <div className={cn('fixed top-20 right-4 z-50', positionClasses, className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            'bg-red-500/90 hover:bg-red-500 text-white shadow-lg border border-red-600',
            'flex items-center gap-2 px-3 py-2 h-auto'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          <Badge variant="destructive" className="bg-white text-red-600 font-bold">
            {activeAlerts.length}
          </Badge>
          <span className="text-sm font-semibold">Alerts</span>
          {criticalAlerts.length > 0 && (
            <span className="text-xs opacity-90">({criticalAlerts.length} Critical)</span>
          )}
        </Button>
      </div>
    );
  }

  // Expanded view - compact card
  return (
    <Card className={cn(
      'bg-slate-800/95 backdrop-blur-sm border-slate-700 shadow-xl max-w-xs',
      positionClasses,
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-semibold text-white">
              Alerts
            </CardTitle>
            <Badge variant="destructive" className="bg-red-500 text-white text-xs">
              {activeAlerts.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {activeAlerts.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissAll}
                className="h-6 px-2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {/* Show only critical alerts by default, or all if expanded */}
        {(isExpanded ? activeAlerts : criticalAlerts).map((alert) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onDismiss={() => handleDismiss(alert.id)}
            compact
          />
        ))}
        
        {/* Show expand button if there are warnings and not expanded */}
        {!isExpanded && warningAlerts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full text-xs text-slate-400 hover:text-white h-6"
          >
            +{warningAlerts.length} warning{warningAlerts.length > 1 ? 's' : ''}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        )}

        {/* Collapse button if expanded */}
        {isExpanded && warningAlerts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="w-full text-xs text-slate-400 hover:text-white h-6"
          >
            Show only critical
            <ChevronUp className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual Alert Item Component
 */
function AlertItem({ 
  alert, 
  onDismiss, 
  compact = false 
}: { 
  alert: Alert; 
  onDismiss: () => void;
  compact?: boolean;
}) {
  const isCritical = alert.severity === 'critical';
  const borderColor = isCritical ? 'border-red-500/50' : 'border-yellow-500/50';
  const bgColor = isCritical ? 'bg-red-500/10' : 'bg-yellow-500/10';
  const textColor = isCritical ? 'text-red-400' : 'text-yellow-400';
  const iconColor = isCritical ? 'text-red-500' : 'text-yellow-500';

  if (compact) {
    return (
      <div className={cn('rounded border p-2', borderColor, bgColor)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isCritical ? (
              <AlertCircle className={cn('h-3 w-3 flex-shrink-0', iconColor)} />
            ) : (
              <AlertTriangle className={cn('h-3 w-3 flex-shrink-0', iconColor)} />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-semibold truncate', textColor)}>
                {alert.indicatorName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {alert.value.toFixed(1)} / {alert.threshold.toFixed(1)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-5 w-5 p-0 text-slate-400 hover:text-white hover:bg-slate-700 flex-shrink-0"
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border p-3', borderColor, bgColor)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          {isCritical ? (
            <AlertCircle className={cn('h-4 w-4 mt-0.5', iconColor)} />
          ) : (
            <AlertTriangle className={cn('h-4 w-4 mt-0.5', iconColor)} />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold', textColor)}>
              {alert.message}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Current: {alert.value.toFixed(2)} | Threshold: {alert.threshold.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

