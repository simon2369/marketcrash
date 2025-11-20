/**
 * Market Data API Utility
 * Fetches market data from Finnhub and FRED APIs
 */

/**
 * Response type for market data functions
 */
export interface MarketDataResponse {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

/**
 * Market news article type
 */
export interface MarketNewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

const FRED_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;

export async function getSP500Data(): Promise<MarketDataResponse> {
  let symbol = 'SPY'; // Use SPY as primary (more reliable), multiply by ~10 for index value
  let useSPYProxy = true; // Flag to track if we're using SPY proxy
  
  try {
    if (!FINNHUB_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your .env.local file');
    }

    // Fetch SPY (S&P 500 ETF) - more reliable than trying ^GSPC
    // SPY is designed to track S&P 500 at roughly 1/10th the value
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    const contentType = response.headers.get('content-type');
    
    // Clone response to read body for error details without consuming it
    const responseClone = response.clone();
    
    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = `Finnhub API error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await responseClone.json();
          if (errorData.error) {
            errorMessage = `Finnhub API error: ${errorData.error}`;
          } else if (errorData.message) {
            errorMessage = `Finnhub API error: ${errorData.message}`;
          }
        } catch (e) {
          // If we can't parse JSON, use the default error message
        }
      }
      
      // Check for common error codes
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or expired Finnhub API key. Please check your NEXT_PUBLIC_FINNHUB_API_KEY');
      } else if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded. Please try again later.');
      } else if (response.status === 500) {
        throw new Error(`Finnhub API server error: ${errorMessage}. This may be a temporary issue.`);
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    
    // Check for API errors in response body
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    // Check if we got valid data
    if (data.c === undefined || data.c === null) {
      throw new Error('Invalid data received from Finnhub API: missing current price');
    }

    if (data.c === 0) {
      throw new Error('Invalid data received from Finnhub API: current price is zero');
    }
    
    // Calculate percentage change
    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
    
    // Multiply SPY by ~10 to approximate S&P 500 index value
    // SPY is designed to be roughly 1/10th of the S&P 500 index
    // Typical ratio is around 9.5-10.5, we'll use 10 for simplicity
    const SPY_TO_INDEX_RATIO = 10;
    const indexValue = data.c * SPY_TO_INDEX_RATIO;
    const indexChange = data.pc ? (data.c - data.pc) * SPY_TO_INDEX_RATIO : 0;
    
    console.log('S&P 500 data:', {
      spyPrice: data.c,
      indexValue,
      changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : 'N/A'
    });
    
    return {
      value: indexValue, // S&P 500 index value (approximated from SPY × 10)
      change: indexChange, // change from previous close
      changePercent: changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching S&P 500 data:', error);
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch S&P 500 data: ${String(error)}`);
  }
}

export async function getDowJonesData(): Promise<MarketDataResponse> {
  try {
    if (!FINNHUB_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your .env.local file');
    }

    // Use DIA (Dow Jones ETF) as proxy - free tier doesn't support ^DJI index
    // DIA tracks Dow Jones at roughly 1/100th the value
    const symbol = 'DIA';
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 60 },
      }
    );

    const contentType = response.headers.get('content-type');
    const responseClone = response.clone();
    
    if (!response.ok) {
      let errorMessage = `Finnhub API error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await responseClone.json();
          if (errorData.error) {
            errorMessage = `Finnhub API error: ${errorData.error}`;
          } else if (errorData.message) {
            errorMessage = `Finnhub API error: ${errorData.message}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or expired Finnhub API key');
      } else if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded');
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    if (data.c === undefined || data.c === null) {
      throw new Error('Invalid data received from Finnhub API: missing current price');
    }

    if (data.c === 0) {
      throw new Error('Invalid data received from Finnhub API: current price is zero');
    }
    
    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
    
    // DIA ETF multiplies by ~100 to approximate Dow Jones index
    // DIA is designed to be roughly 1/100th of the Dow Jones index
    const DOW_TO_INDEX_RATIO = 100;
    const indexValue = data.c * DOW_TO_INDEX_RATIO;
    const indexChange = data.pc ? (data.c - data.pc) * DOW_TO_INDEX_RATIO : 0;
    
    console.log('Dow Jones data:', {
      symbol,
      diaPrice: data.c,
      indexValue,
      changePercent,
    });
    
    return {
      value: indexValue,
      change: indexChange,
      changePercent: changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Dow Jones data:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch Dow Jones data: ${String(error)}`);
  }
}

export async function getNasdaq100Data(): Promise<MarketDataResponse> {
  try {
    if (!FINNHUB_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your .env.local file');
    }

    // Use QQQ (Nasdaq 100 ETF) as proxy - free tier doesn't support ^NDX index
    // QQQ tracks Nasdaq 100 at roughly 1/4th the value
    const symbol = 'QQQ';
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 60 },
      }
    );

    const contentType = response.headers.get('content-type');
    const responseClone = response.clone();
    
    if (!response.ok) {
      let errorMessage = `Finnhub API error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await responseClone.json();
          if (errorData.error) {
            errorMessage = `Finnhub API error: ${errorData.error}`;
          } else if (errorData.message) {
            errorMessage = `Finnhub API error: ${errorData.message}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or expired Finnhub API key');
      } else if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded');
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    if (data.c === undefined || data.c === null) {
      throw new Error('Invalid data received from Finnhub API: missing current price');
    }

    if (data.c === 0) {
      throw new Error('Invalid data received from Finnhub API: current price is zero');
    }
    
    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
    
    // QQQ ETF multiplies by ~4 to approximate Nasdaq 100 index
    // QQQ is designed to track Nasdaq 100 at roughly 1/4th the value
    const NASDAQ_TO_INDEX_RATIO = 4;
    const indexValue = data.c * NASDAQ_TO_INDEX_RATIO;
    const indexChange = data.pc ? (data.c - data.pc) * NASDAQ_TO_INDEX_RATIO : 0;
    
    console.log('Nasdaq 100 data:', {
      symbol,
      qqqPrice: data.c,
      indexValue,
      changePercent,
    });
    
    return {
      value: indexValue,
      change: indexChange,
      changePercent: changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Nasdaq 100 data:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch Nasdaq 100 data: ${String(error)}`);
  }
}

/**
 * Get stock data for a specific symbol
 */
export async function getStockData(symbol: string): Promise<MarketDataResponse> {
  try {
    if (!FINNHUB_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 60 },
      }
    );

    const contentType = response.headers.get('content-type');
    const responseClone = response.clone();
    
    if (!response.ok) {
      let errorMessage = `Finnhub API error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await responseClone.json();
          if (errorData.error) {
            errorMessage = `Finnhub API error: ${errorData.error}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    if (data.c === undefined || data.c === null || data.c === 0) {
      throw new Error(`Invalid data received for ${symbol}`);
    }
    
    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
    
    return {
      value: data.c,
      change: data.pc ? data.c - data.pc : 0,
      changePercent: changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch stock data for ${symbol}: ${String(error)}`);
  }
}

export async function getVIXData(): Promise<MarketDataResponse> {
  try {
    if (!FRED_KEY) {
      throw new Error('FRED_API_KEY is not configured');
    }

    // FRED API for VIX (still free and unlimited!)
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${FRED_KEY}&file_type=json&limit=2&sort_order=desc`
    );

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    
    // Check for FRED API errors
    if (data.error_code && data.error_message) {
      throw new Error(`FRED API error: ${data.error_message}`);
    }

    if (!data.observations || data.observations.length === 0) {
      throw new Error('No VIX data found in FRED API response');
    }
    
    const latestObservation = data.observations[0];
    const previousObservation = data.observations[1];
    
    if (!latestObservation.value || latestObservation.value === '.') {
      throw new Error('Invalid VIX value in FRED API response');
    }
    
    const value = parseFloat(latestObservation.value);
    const previousValue = previousObservation && previousObservation.value !== '.' 
      ? parseFloat(previousObservation.value) 
      : value;
    const change = value - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    return {
      value: value,
      change: change,
      changePercent: changePercent,
      timestamp: latestObservation.date 
        ? new Date(latestObservation.date + 'T16:00:00Z').toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching VIX data:', error);
    throw error;
  }
}

// Optional: Get multiple stocks at once
export async function getMultipleStocks(symbols: string[]) {
  try {
    const promises = symbols.map(symbol =>
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`)
        .then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
}

/**
 * Get Crypto Price Data
 * Fetches from Finnhub API using crypto symbols
 */
export async function getCryptoData(symbol: string): Promise<MarketDataResponse> {
  try {
    if (!FINNHUB_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    // Finnhub uses BINANCE:BTCUSDT format for crypto
    const finnhubSymbol = symbol === 'BTC' ? 'BINANCE:BTCUSDT' :
                         symbol === 'ETH' ? 'BINANCE:ETHUSDT' :
                         symbol === 'XRP' ? 'BINANCE:XRPUSDT' : symbol;

    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 60 },
      }
    );

    const contentType = response.headers.get('content-type');
    const responseClone = response.clone();
    
    if (!response.ok) {
      let errorMessage = `Finnhub API error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await responseClone.json();
          if (errorData.error) {
            errorMessage = `Finnhub API error: ${errorData.error}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    if (data.c === undefined || data.c === null || data.c === 0) {
      throw new Error(`Invalid data received for ${symbol}`);
    }
    
    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
    
    return {
      value: data.c,
      change: data.pc ? data.c - data.pc : 0,
      changePercent: changePercent,
      timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching crypto data for ${symbol}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch crypto data for ${symbol}: ${String(error)}`);
  }
}

/**
 * Get Commodity Price Data
 * Fetches from FRED API (more reliable for commodities than Finnhub)
 */
export async function getCommodityData(symbol: string): Promise<MarketDataResponse> {
  try {
    if (!FRED_KEY) {
      throw new Error('FRED_API_KEY is not configured');
    }

    // FRED API series IDs for commodities
    const fredSeriesId = symbol === 'GOLD' ? 'GOLDAMGBD228NLBM' :  // Gold (London Fixing)
                        symbol === 'SILVER' ? 'SLVPRUSD' :          // Silver Price USD
                        symbol === 'OIL' ? 'DCOILWTICO' :           // Crude Oil WTI
                        null;

    if (!fredSeriesId) {
      throw new Error(`Unsupported commodity symbol: ${symbol}`);
    }

    // Fetch from FRED API
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${fredSeriesId}&api_key=${FRED_KEY}&file_type=json&limit=2&sort_order=desc`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (commodities update daily)
      }
    );

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    
    // Check for FRED API errors
    if (data.error_code && data.error_message) {
      throw new Error(`FRED API error: ${data.error_message}`);
    }

    if (!data.observations || data.observations.length === 0) {
      throw new Error(`No ${symbol} data found in FRED API response`);
    }
    
    const latestObservation = data.observations[0];
    const previousObservation = data.observations[1];
    
    if (!latestObservation.value || latestObservation.value === '.') {
      throw new Error(`Invalid ${symbol} value in FRED API response`);
    }
    
    const value = parseFloat(latestObservation.value);
    const previousValue = previousObservation && previousObservation.value !== '.' 
      ? parseFloat(previousObservation.value) 
      : value;
    const change = value - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    return {
      value: value,
      change: change,
      changePercent: changePercent,
      timestamp: latestObservation.date 
        ? new Date(latestObservation.date + 'T16:00:00Z').toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching commodity data for ${symbol}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch commodity data for ${symbol}: ${String(error)}`);
  }
}

/**
 * Get market news from Finnhub
 * Filters for crash/recession/market keywords and returns top 15 articles
 */
export async function getMarketNews(): Promise<MarketNewsArticle[]> {
  try {
    if (!FINNHUB_KEY) {
      console.warn('FINNHUB_API_KEY is not configured. Returning empty news array.');
      return [];
    }

    // General market news
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!response.ok) {
      // For news, we'll return empty array instead of throwing
      if (response.status === 401 || response.status === 403) {
        console.warn('Invalid or expired Finnhub API key for news. Returning empty array.');
        return [];
      } else if (response.status === 429) {
        console.warn('Finnhub API rate limit exceeded for news. Returning empty array.');
        return [];
      } else if (response.status === 500) {
        console.warn(`Finnhub API server error for news: ${response.status} ${response.statusText}. Returning empty array.`);
        return [];
      }
      console.warn(`Finnhub API error for news: ${response.status} ${response.statusText}. Returning empty array.`);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Expected JSON but got ${contentType} for news. Returning empty array.`);
      return [];
    }

    const news = await response.json();

    // Check for API errors in response body
    if (news.error) {
      console.warn(`Finnhub API error for news: ${news.error}. Returning empty array.`);
      return [];
    }

    if (!Array.isArray(news)) {
      console.warn('Invalid data format from Finnhub API for news. Returning empty array.');
      return [];
    }

    // Filter for crash/recession/market keywords
    const keywords = ['market', 'crash', 'recession', 'fed', 'stocks', 'economy', 'downturn', 'bear market', 'bubble'];

    const filteredNews = news
      .filter((article: any) =>
        keywords.some(keyword =>
          article.headline?.toLowerCase().includes(keyword) ||
          article.summary?.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 15); // Top 15 articles

    return filteredNews.map((article: any) => ({
      id: article.id || Math.random(),
      headline: article.headline || article.title || '',
      summary: article.summary || article.description || '',
      source: article.source || '',
      url: article.url || '',
      image: article.image || '',
      datetime: article.datetime || (article.publishedAt ? new Date(article.publishedAt).getTime() / 1000 : Date.now() / 1000),
      sentiment: (article.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
    }));
  } catch (error) {
    console.error('Error fetching Finnhub news:', error);
    return [];
  }
}

/**
 * Get company-specific news (for tracking key stocks)
 * @param symbol - Stock symbol (e.g., 'AAPL', 'SPY')
 * @returns Array of news articles for the specified company
 */
export async function getFinnhubCompanyNews(symbol: string): Promise<any[]> {
  try {
    if (!FINNHUB_KEY) {
      console.warn('FINNHUB_API_KEY is not configured. Returning empty news array.');
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${weekAgo}&to=${today}&token=${FINNHUB_KEY}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.warn(`Error fetching company news for ${symbol}: ${response.status} ${response.statusText}`);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Expected JSON but got ${contentType} for company news. Returning empty array.`);
      return [];
    }

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.warn(`Finnhub API error for company news: ${data.error}`);
      return [];
    }

    if (!Array.isArray(data)) {
      console.warn('Invalid data format from Finnhub API for company news. Returning empty array.');
      return [];
    }

    return data;
  } catch (error) {
    console.error(`Error fetching Finnhub company news for ${symbol}:`, error);
    return [];
  }
}
