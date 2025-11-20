/**
 * Market Data Types
 */
export interface MarketData {
  price: number;
  volume: number;
  timestamp: Date | string;
  symbol?: string;
  change?: number;
  changePercent?: number;
}

/**
 * Economic Indicator Types
 */
export type IndicatorStatus = 'normal' | 'warning' | 'critical';

export interface EconomicIndicator {
  name: string;
  value: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: IndicatorStatus;
  unit?: string;
  description?: string;
  lastUpdated?: Date | string;
}

/**
 * Timeline Event Types
 */
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EventCategory = 
  | 'market-crash'
  | 'economic-indicator'
  | 'policy-change'
  | 'news'
  | 'technical'
  | 'other';

export interface TimelineEvent {
  date: Date | string;
  title: string;
  severity: EventSeverity;
  category: EventCategory;
  description?: string;
  source?: string;
  impact?: number; // 0-100 scale
}

/**
 * Alert Threshold Types
 */
export type MetricType = 
  | 'price-drop'
  | 'volume-spike'
  | 'volatility'
  | 'indicator-value'
  | 'correlation'
  | 'other';

export interface AlertThreshold {
  metric: MetricType;
  warning: number;
  critical: number;
  enabled?: boolean;
  description?: string;
}

/**
 * Combined Dashboard Types
 */
export interface DashboardState {
  marketData: MarketData[];
  indicators: EconomicIndicator[];
  timeline: TimelineEvent[];
  alerts: Alert[];
  thresholds: AlertThreshold[];
}

export interface Alert {
  id: string;
  metric: MetricType;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date | string;
  acknowledged?: boolean;
  value: number;
  threshold: number;
}



