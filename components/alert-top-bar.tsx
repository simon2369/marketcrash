'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CombinedEconomicIndicators } from '@/hooks/use-economic-indicators';

interface AlertTopBarProps {
  indicators?: CombinedEconomicIndicators;
  className?: string;
}

type AlertSeverity = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  severity: AlertSeverity;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

/**
 * Get dismissed alert keys from localStorage
 * Uses format: "indicator-severity" (e.g., "cape-critical", "yield-warning")
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
 * Generate alert key from alert ID (extracts indicator and severity)
 * e.g., "cape-critical" -> "cape-critical", "yield-warning" -> "yield-warning"
 */
function getAlertKey(alertId: string): string {
  // Alert IDs are in format: "indicator-severity" or "indicator-critical-timestamp"
  // Extract just the indicator and severity parts
  const parts = alertId.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`; // e.g., "cape-critical"
  }
  return alertId;
}

export function AlertTopBar({ indicators, className }: AlertTopBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<Set<string>>(new Set());

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    setDismissedAlertKeys(getDismissedAlertKeys());
  }, []);

  // Generate alerts from indicators
  const alerts: Alert[] = [];
  
  if (indicators) {
    // CAPE Ratio alert
    if (indicators.cape.status === 'danger') {
      alerts.push({
        id: 'cape-critical',
        severity: 'critical',
        metric: 'CAPE Ratio',
        value: indicators.cape.value,
        threshold: indicators.cape.dangerLevel,
        message: `CAPE Ratio at ${indicators.cape.value.toFixed(1)} (Danger level: ${indicators.cape.dangerLevel})`,
      });
    } else if (indicators.cape.status === 'warning') {
      alerts.push({
        id: 'cape-warning',
        severity: 'warning',
        metric: 'CAPE Ratio',
        value: indicators.cape.value,
        threshold: indicators.cape.warningLevel,
        message: `CAPE Ratio at ${indicators.cape.value.toFixed(1)} (Warning level: ${indicators.cape.warningLevel})`,
      });
    }

    // Yield Curve alert
    if (indicators.yieldCurve.status === 'danger') {
      alerts.push({
        id: 'yield-critical',
        severity: 'critical',
        metric: 'Yield Curve',
        value: indicators.yieldCurve.value,
        threshold: indicators.yieldCurve.dangerLevel,
        message: `Yield Curve inverted at ${indicators.yieldCurve.value.toFixed(2)}% (Danger: ${indicators.yieldCurve.dangerLevel}%)`,
      });
    } else if (indicators.yieldCurve.status === 'warning') {
      alerts.push({
        id: 'yield-warning',
        severity: 'warning',
        metric: 'Yield Curve',
        value: indicators.yieldCurve.value,
        threshold: indicators.yieldCurve.warningLevel,
        message: `Yield Curve narrowing at ${indicators.yieldCurve.value.toFixed(2)}% (Warning: ${indicators.yieldCurve.warningLevel}%)`,
      });
    }

    // Margin Debt alert
    if (indicators.marginDebt.status === 'danger') {
      alerts.push({
        id: 'margin-critical',
        severity: 'critical',
        metric: 'Margin Debt',
        value: indicators.marginDebt.value,
        threshold: indicators.marginDebt.dangerLevel,
        message: `Margin Debt at ${indicators.marginDebt.value.toFixed(1)}% of GDP (Danger: ${indicators.marginDebt.dangerLevel}%)`,
      });
    } else if (indicators.marginDebt.status === 'warning') {
      alerts.push({
        id: 'margin-warning',
        severity: 'warning',
        metric: 'Margin Debt',
        value: indicators.marginDebt.value,
        threshold: indicators.marginDebt.warningLevel,
        message: `Margin Debt elevated at ${indicators.marginDebt.value.toFixed(1)}% of GDP (Warning: ${indicators.marginDebt.warningLevel}%)`,
      });
    }

    // Credit Spreads alert
    if (indicators.creditSpreads.status === 'danger') {
      alerts.push({
        id: 'credit-critical',
        severity: 'critical',
        metric: 'Credit Spreads',
        value: indicators.creditSpreads.value,
        threshold: indicators.creditSpreads.dangerLevel,
        message: `Credit Spreads widening to ${indicators.creditSpreads.value.toFixed(1)}% (Danger: ${indicators.creditSpreads.dangerLevel}%)`,
      });
    }

    // Buffett Indicator alert
    if (indicators.buffett.status === 'danger') {
      alerts.push({
        id: 'buffett-critical',
        severity: 'critical',
        metric: 'Buffett Indicator',
        value: indicators.buffett.value,
        threshold: indicators.buffett.dangerLevel,
        message: `Market Cap/GDP at ${indicators.buffett.value.toFixed(1)}% (Danger: ${indicators.buffett.dangerLevel}%)`,
      });
    } else if (indicators.buffett.status === 'warning') {
      alerts.push({
        id: 'buffett-warning',
        severity: 'warning',
        metric: 'Buffett Indicator',
        value: indicators.buffett.value,
        threshold: indicators.buffett.warningLevel,
        message: `Market Cap/GDP elevated at ${indicators.buffett.value.toFixed(1)}% (Warning: ${indicators.buffett.warningLevel}%)`,
      });
    }
  }

  // Filter out dismissed alerts by checking alert keys
  const activeAlerts = alerts.filter(alert => {
    const alertKey = getAlertKey(alert.id);
    return !dismissedAlertKeys.has(alertKey);
  });

  // Count by severity
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  const handleDismiss = (alertId: string) => {
    const alertKey = getAlertKey(alertId);
    const newDismissed = new Set([...dismissedAlertKeys, alertKey]);
    setDismissedAlertKeys(newDismissed);
    saveDismissedAlertKeys(newDismissed);
  };

  const handleClearAll = () => {
    const allAlertKeys = new Set(alerts.map(a => getAlertKey(a.id)));
    const newDismissed = new Set([...dismissedAlertKeys, ...allAlertKeys]);
    setDismissedAlertKeys(newDismissed);
    saveDismissedAlertKeys(newDismissed);
  };

  // Don't render if no active alerts
  if (activeAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/50 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Compact Bar */}
      <div
        className={cn(
          'flex items-center justify-between px-4 lg:px-6 py-2 cursor-pointer transition-colors',
          'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700',
          criticalCount > 0
            ? 'border-red-500/30 hover:bg-slate-800'
            : 'border-yellow-500/30 hover:bg-slate-800'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 w-full max-w-7xl mx-auto justify-between">
          <div className="flex items-center gap-3">
            {/* Alert Icon */}
            <div className="flex items-center gap-2">
              {criticalCount > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              )}
              <span className="font-semibold text-white">
                Alerts
              </span>
            </div>

            {/* Badge Counts */}
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500 text-slate-900">
                  {warningCount} Warning
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Clear All
            </button>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Alert List */}
      {isExpanded && (
        <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 max-h-96 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-2 max-w-7xl mx-auto">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all',
                  getSeverityColor(alert.severity)
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-white">
                        {alert.metric}
                      </p>
                      <p className="text-sm text-slate-300 mt-0.5">
                        {alert.message}
                      </p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex-shrink-0 p-1 hover:bg-slate-700/50 rounded transition-colors"
                      aria-label="Dismiss alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

