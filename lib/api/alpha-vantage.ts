import { MarketData } from '@/lib/types';

/**
 * Alpha Vantage API Response Types
 */
interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '5. Output Size'?: string;
    '6. Time Zone': string;
  };
  'Time Series (Daily)'?: {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
  'Time Series (1min)'?: {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface AlphaVantageErrorResponse {
  'Error Message'?: string;
  'Note'?: string;
  'Information'?: string;
}

/**
 * Custom Error Class for Alpha Vantage API
 */
export class AlphaVantageError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AlphaVantageError';
  }
}

/**
 * Get API Key from environment variables
 */
function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new AlphaVantageError(
      'Alpha Vantage API key is not configured. Please set NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY in your environment variables.',
      500,
      'MISSING_API_KEY'
    );
  }
  return apiKey;
}

/**
 * Base function to fetch data from Alpha Vantage API
 */
async function fetchAlphaVantageData(
  functionName: string,
  symbol: string,
  params?: Record<string, string>
): Promise<Response> {
  const apiKey = getApiKey();
  const baseUrl = 'https://www.alphavantage.co/query';
  
  const searchParams = new URLSearchParams({
    function: functionName,
    symbol,
    apikey: apiKey,
    ...params,
  });

  const url = `${baseUrl}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new AlphaVantageError(
        `API request failed with status ${response.status}`,
        response.status,
        'HTTP_ERROR'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AlphaVantageError) {
      throw error;
    }
    throw new AlphaVantageError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Parse and validate Alpha Vantage response
 */
function parseResponse<T>(data: unknown): T {
  // Check for error responses
  const errorData = data as AlphaVantageErrorResponse;
  if (errorData['Error Message']) {
    throw new AlphaVantageError(
      errorData['Error Message'],
      undefined,
      'API_ERROR'
    );
  }
  if (errorData['Note']) {
    throw new AlphaVantageError(
      'API call frequency limit reached. Please try again later.',
      429,
      'RATE_LIMIT'
    );
  }
  if (errorData['Information']) {
    throw new AlphaVantageError(
      errorData['Information'],
      undefined,
      'API_INFO'
    );
  }

  return data as T;
}

/**
 * Get S&P 500 current price and market data
 * Uses SPY ETF as a proxy for S&P 500
 */
export async function getSP500CurrentPrice(): Promise<MarketData> {
  try {
    const response = await fetchAlphaVantageData('GLOBAL_QUOTE', 'SPY');
    const data = await response.json();
    const parsed = parseResponse<AlphaVantageQuoteResponse>(data);

    const quote = parsed['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new AlphaVantageError(
        'Invalid response format from Alpha Vantage API',
        undefined,
        'INVALID_RESPONSE'
      );
    }

    const price = parseFloat(quote['05. price']);
    const volume = parseInt(quote['06. volume'] || '0', 10);
    const change = parseFloat(quote['09. change'] || '0');
    const changePercent = parseFloat(
      quote['10. change percent']?.replace('%', '') || '0'
    );
    const timestamp = quote['07. latest trading day']
      ? new Date(quote['07. latest trading day'])
      : new Date();

    return {
      price,
      volume,
      timestamp,
      symbol: 'SPY',
      change,
      changePercent,
    };
  } catch (error) {
    if (error instanceof AlphaVantageError) {
      throw error;
    }
    throw new AlphaVantageError(
      `Failed to fetch S&P 500 data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get VIX (Volatility Index) current price and market data
 */
export async function getVIXData(): Promise<MarketData> {
  try {
    // VIX is typically accessed via ^VIX symbol, but Alpha Vantage may use different symbol
    // Try common VIX-related symbols
    let response: Response;
    let symbol = 'VIX';
    
    try {
      response = await fetchAlphaVantageData('GLOBAL_QUOTE', '^VIX');
    } catch {
      // Fallback to VIXY (VIX ETF) if ^VIX doesn't work
      try {
        response = await fetchAlphaVantageData('GLOBAL_QUOTE', 'VIXY');
        symbol = 'VIXY';
      } catch {
        // Last fallback to VIX
        response = await fetchAlphaVantageData('GLOBAL_QUOTE', 'VIX');
      }
    }

    const data = await response.json();
    const parsed = parseResponse<AlphaVantageQuoteResponse>(data);

    const quote = parsed['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new AlphaVantageError(
        'Invalid response format from Alpha Vantage API for VIX',
        undefined,
        'INVALID_RESPONSE'
      );
    }

    const price = parseFloat(quote['05. price']);
    const volume = parseInt(quote['06. volume'] || '0', 10);
    const change = parseFloat(quote['09. change'] || '0');
    const changePercent = parseFloat(
      quote['10. change percent']?.replace('%', '') || '0'
    );
    const timestamp = quote['07. latest trading day']
      ? new Date(quote['07. latest trading day'])
      : new Date();

    return {
      price,
      volume,
      timestamp,
      symbol: symbol === '^VIX' ? 'VIX' : symbol,
      change,
      changePercent,
    };
  } catch (error) {
    if (error instanceof AlphaVantageError) {
      throw error;
    }
    throw new AlphaVantageError(
      `Failed to fetch VIX data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get historical time series data for a symbol
 */
export async function getTimeSeriesData(
  symbol: string,
  interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'
): Promise<MarketData[]> {
  try {
    const functionName = interval === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY';
    const params = interval !== 'daily' ? { interval } : undefined;
    
    const response = await fetchAlphaVantageData(functionName, symbol, params);
    const data = await response.json();
    const parsed = parseResponse<AlphaVantageTimeSeriesResponse>(data);

    const timeSeriesKey = interval === 'daily' 
      ? 'Time Series (Daily)'
      : 'Time Series (1min)';
    
    const timeSeries = parsed[timeSeriesKey];
    if (!timeSeries) {
      throw new AlphaVantageError(
        'No time series data found in response',
        undefined,
        'NO_DATA'
      );
    }

    const marketData: MarketData[] = Object.entries(timeSeries)
      .map(([date, values]) => ({
        price: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10),
        timestamp: new Date(date),
        symbol,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateA - dateB;
      });

    return marketData;
  } catch (error) {
    if (error instanceof AlphaVantageError) {
      throw error;
    }
    throw new AlphaVantageError(
      `Failed to fetch time series data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'FETCH_ERROR'
    );
  }
}

