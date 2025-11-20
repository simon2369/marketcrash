/**
 * Economic Indicators API Utility
 * Fetches economic indicator data from FRED API and other sources
 */

/**
 * Indicator status type
 */
export type IndicatorStatus = 'safe' | 'warning' | 'danger';

/**
 * Economic Indicator Response
 */
export interface EconomicIndicatorResponse {
  value: number;
  status: IndicatorStatus;
  historicalAvg: number;
  warningLevel: number;
  dangerLevel: number;
  timestamp: string;
  description: string;
}

/**
 * Custom Error Class for Economic Indicators API
 */
export class EconomicIndicatorError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'EconomicIndicatorError';
  }
}

/**
 * FRED API Response Types
 */
interface FREDObservationsResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

interface FREDErrorResponse {
  error_code?: number;
  error_message?: string;
}

/**
 * Get FRED API Key from environment variables
 */
function getFREDApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;
  if (!apiKey) {
    throw new EconomicIndicatorError(
      'FRED API key is not configured. Please set NEXT_PUBLIC_FRED_API_KEY in your environment variables.',
      500,
      'MISSING_API_KEY'
    );
  }
  return apiKey;
}

/**
 * Fetch data from FRED API
 */
async function fetchFREDData(seriesId: string, limit: number = 1): Promise<FREDObservationsResponse> {
  const apiKey = getFREDApiKey();
  const baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
  
  const searchParams = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    limit: limit.toString(),
    sort_order: 'desc', // Most recent first
  });

  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour (economic data updates less frequently)
  });

  if (!response.ok) {
    throw new EconomicIndicatorError(
      `FRED API request failed with status ${response.status}`,
      response.status,
      'HTTP_ERROR'
    );
  }

  const data = await response.json();

  // Check for error responses
  const errorData = data as FREDErrorResponse;
  if (errorData.error_code && errorData.error_message) {
    throw new EconomicIndicatorError(
      errorData.error_message,
      errorData.error_code,
      'API_ERROR'
    );
  }

  return data as FREDObservationsResponse;
}

/**
 * Determine status based on value and thresholds
 */
function determineStatus(
  value: number,
  warningLevel: number,
  dangerLevel: number,
  invertThresholds: boolean = false
): IndicatorStatus {
  if (invertThresholds) {
    // Lower values are worse (e.g., yield curve inversion)
    if (value <= dangerLevel) return 'danger';
    if (value <= warningLevel) return 'warning';
    return 'safe';
  } else {
    // Higher values are worse (e.g., CAPE ratio)
    if (value >= dangerLevel) return 'danger';
    if (value >= warningLevel) return 'warning';
    return 'safe';
  }
}

/**
 * Get CAPE Ratio (Shiller P/E)
 * Reads from local JSON file (updated monthly via parseShillerData.js script)
 * Set monthly reminder: Update /public/data/shiller-data.xls and rerun parser script
 */
export async function getCAPERatio(): Promise<EconomicIndicatorResponse> {
  // Fallback data structure
  const fallbackData: EconomicIndicatorResponse = {
    value: 39.2,
    status: 'danger' as const,
    historicalAvg: 16.8,
    warningLevel: 25,
    dangerLevel: 30,
    timestamp: new Date().toISOString(),
    description: 'Shiller P/E - Cyclically Adjusted Price-to-Earnings',
  };

  try {
    // Read from local JSON file using Node.js fs (server-side only)
    // Use dynamic imports to avoid bundling issues
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'cape-latest.json');
    
    try {
      const fileContents = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContents);

      if (!data || typeof data.cape !== 'number') {
        console.warn('Invalid CAPE data structure, using fallback');
        return fallbackData;
      }

      const value = parseFloat(String(data.cape));
      if (isNaN(value)) {
        console.warn('CAPE value is not a number, using fallback');
        return fallbackData;
      }

      const historicalAvg = data.historicalAverage || 16.8;
      const warningLevel = 25;
      const dangerLevel = 30;

      const status = determineStatus(value, warningLevel, dangerLevel);

      return {
        value,
        status,
        historicalAvg,
        warningLevel,
        dangerLevel,
        timestamp: data.updatedAt || data.date || new Date().toISOString(),
        description: 'Shiller P/E - Cyclically Adjusted Price-to-Earnings',
      };
    } catch (fileError) {
      // File not found or can't be read - use fallback
      console.warn('Could not read CAPE file, using fallback:', fileError instanceof Error ? fileError.message : 'Unknown error');
      return fallbackData;
    }
  } catch (error) {
    // Any other error - use fallback
    console.error('Error fetching CAPE ratio:', error);
    return fallbackData;
  }
}

/**
 * Get Yield Curve Spread (10Y-3M)
 * Fetches from FRED API (series: T10Y3M)
 */
export async function getYieldCurveSpread(): Promise<EconomicIndicatorResponse> {
  try {
    const data = await fetchFREDData('T10Y3M', 1);
    
    if (!data.observations || data.observations.length === 0) {
      throw new EconomicIndicatorError(
        'No yield curve data found in FRED API response',
        undefined,
        'NO_DATA'
      );
    }

    const latest = data.observations[0];
    if (!latest.value || latest.value === '.') {
      throw new EconomicIndicatorError(
        'Invalid yield curve value in FRED API response',
        undefined,
        'INVALID_RESPONSE'
      );
    }

    const value = parseFloat(latest.value);
    const historicalAvg = 1.5; // Typical positive spread
    const warningLevel = 0.5;
    const dangerLevel = 0; // Inversion threshold

    const status = determineStatus(value, warningLevel, dangerLevel, true); // Inverted is bad

    return {
      value,
      status,
      historicalAvg,
      warningLevel,
      dangerLevel,
      timestamp: latest.date 
        ? new Date(latest.date + 'T16:00:00Z').toISOString()
        : new Date().toISOString(),
      description: '10-Year minus 3-Month Treasury Spread',
    };
  } catch (error) {
    if (error instanceof EconomicIndicatorError) {
      throw error;
    }
    throw new EconomicIndicatorError(
      `Failed to fetch Yield Curve Spread: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get Margin Debt / GDP
 * Manual/mock for now (FINRA publishes monthly)
 * TODO: Integrate with FINRA API or manual data source
 */
export async function getMarginDebt(): Promise<EconomicIndicatorResponse> {
  try {
    // TODO: Replace with actual FINRA data or manual calculation
    // FINRA publishes margin debt data monthly
    // GDP data available from FRED (GDP)

    // Mock data for now
    const value = 3.8;
    const historicalAvg = 1.8;
    const warningLevel = 2.5;
    const dangerLevel = 3.0;

    const status = determineStatus(value, warningLevel, dangerLevel);

    return {
      value,
      status,
      historicalAvg,
      warningLevel,
      dangerLevel,
      timestamp: new Date().toISOString(),
      description: 'Margin Debt as percentage of GDP',
    };
  } catch (error) {
    if (error instanceof EconomicIndicatorError) {
      throw error;
    }
    throw new EconomicIndicatorError(
      `Failed to fetch Margin Debt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get Credit Spreads (High Yield)
 * Fetches from FRED API (series: BAMLH0A0HYM2)
 * ICE BofA High Yield Option-Adjusted Spread
 */
export async function getCreditSpreads(): Promise<EconomicIndicatorResponse> {
  try {
    const data = await fetchFREDData('BAMLH0A0HYM2', 1);
    
    if (!data.observations || data.observations.length === 0) {
      throw new EconomicIndicatorError(
        'No credit spread data found in FRED API response',
        undefined,
        'NO_DATA'
      );
    }

    const latest = data.observations[0];
    if (!latest.value || latest.value === '.') {
      throw new EconomicIndicatorError(
        'Invalid credit spread value in FRED API response',
        undefined,
        'INVALID_RESPONSE'
      );
    }

    const value = parseFloat(latest.value);
    const historicalAvg = 4.0; // Typical spread
    const warningLevel = 5.0;
    const dangerLevel = 7.0;

    const status = determineStatus(value, warningLevel, dangerLevel);

    return {
      value,
      status,
      historicalAvg,
      warningLevel,
      dangerLevel,
      timestamp: latest.date 
        ? new Date(latest.date + 'T16:00:00Z').toISOString()
        : new Date().toISOString(),
      description: 'ICE BofA High Yield Option-Adjusted Spread',
    };
  } catch (error) {
    if (error instanceof EconomicIndicatorError) {
      throw error;
    }
    throw new EconomicIndicatorError(
      `Failed to fetch Credit Spreads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get Buffett Indicator (Market Cap / GDP)
 * Mock for now - requires market cap and GDP data
 * TODO: Calculate from actual market cap and GDP data
 */
export async function getBuffettIndicator(): Promise<EconomicIndicatorResponse> {
  try {
    // TODO: Calculate from actual data
    // Market Cap: Can use Wilshire 5000 or S&P 500 market cap
    // GDP: Available from FRED (GDP series)
    // Formula: (Market Cap / GDP) * 100

    // Mock data for now
    const value = 228;
    const historicalAvg = 80;
    const warningLevel = 115;
    const dangerLevel = 160;

    const status = determineStatus(value, warningLevel, dangerLevel);

    return {
      value,
      status,
      historicalAvg,
      warningLevel,
      dangerLevel,
      timestamp: new Date().toISOString(),
      description: 'Market Capitalization / GDP Ratio',
    };
  } catch (error) {
    if (error instanceof EconomicIndicatorError) {
      throw error;
    }
    throw new EconomicIndicatorError(
      `Failed to fetch Buffett Indicator: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

