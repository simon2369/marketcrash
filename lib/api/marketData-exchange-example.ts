/**
 * EXAMPLE: How to integrate Exchange APIs (CME/CBOE) into marketData.ts
 * 
 * This file shows how to modify the existing functions to use exchange APIs
 * Copy the pattern below into marketData.ts
 */

import { MarketDataResponse } from './marketData';
import { fetchMarketDataFromExchange, getExchangeSymbol } from './tradingview-adapter';

const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'finnhub';
const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

/**
 * EXAMPLE: Modified getSP500Data with Exchange API support
 * 
 * This function tries the exchange API first, then falls back to Finnhub
 */
export async function getSP500DataExample(): Promise<MarketDataResponse> {
  // Try exchange API if configured
  if (DATA_SOURCE === 'CME' || DATA_SOURCE === 'CBOE' || DATA_SOURCE === 'broker') {
    try {
      const exchange = DATA_SOURCE === 'CME' ? 'CME' : DATA_SOURCE === 'CBOE' ? 'CBOE' : 'broker';
      const symbol = getExchangeSymbol('SP500', exchange === 'CME' ? 'CME' : 'CBOE');
      
      const exchangeData = await fetchMarketDataFromExchange(symbol, exchange);
      
      // CME returns futures prices, may need conversion
      // CBOE returns index prices directly
      if (exchange === 'CME') {
        // ES futures price may need adjustment for index equivalent
        // Adjust based on your needs
        return exchangeData;
      }
      
      return exchangeData;
    } catch (error) {
      console.warn('Exchange API failed, falling back to Finnhub:', error);
      // Fall through to Finnhub fallback
    }
  }

  // Fallback to existing Finnhub implementation
  if (!FINNHUB_KEY) {
    throw new Error('No API key configured. Set NEXT_PUBLIC_FINNHUB_API_KEY or exchange API keys in .env.local');
  }

  // ... existing Finnhub code ...
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=SPY&token=${FINNHUB_KEY}`,
    { next: { revalidate: 60 } }
  );
  
  // ... rest of existing implementation ...
  
  return {} as MarketDataResponse; // Placeholder
}

/**
 * EXAMPLE: Modified getVIXData with CBOE API support
 * 
 * VIX is a CBOE product, so CBOE API is ideal
 */
export async function getVIXDataExample(): Promise<MarketDataResponse> {
  // CBOE is the source of VIX data
  if (DATA_SOURCE === 'CBOE' || DATA_SOURCE === 'broker') {
    try {
      const exchange = DATA_SOURCE === 'CBOE' ? 'CBOE' : 'broker';
      const symbol = getExchangeSymbol('VIX', 'CBOE'); // Returns 'VIX'
      
      return await fetchMarketDataFromExchange(symbol, exchange);
    } catch (error) {
      console.warn('CBOE API failed, falling back to FRED:', error);
      // Fall through to FRED fallback
    }
  }

  // Fallback to existing FRED implementation
  // ... existing FRED code ...
  
  return {} as MarketDataResponse; // Placeholder
}

/**
 * EXAMPLE: Modified getCommodityData with CME API support
 * 
 * CME is the primary source for commodities (Gold, Oil, Silver)
 */
export async function getGoldDataExample(): Promise<MarketDataResponse> {
  if (DATA_SOURCE === 'CME' || DATA_SOURCE === 'broker') {
    try {
      const exchange = DATA_SOURCE === 'CME' ? 'CME' : 'broker';
      const symbol = getExchangeSymbol('GOLD', 'CME'); // Returns 'GC'
      
      return await fetchMarketDataFromExchange(symbol, exchange);
    } catch (error) {
      console.warn('CME API failed, falling back to alternative:', error);
      // Fall through to fallback
    }
  }

  // Fallback implementation
  // ... existing code ...
  
  return {} as MarketDataResponse; // Placeholder
}

/**
 * Integration Pattern Summary:
 * 
 * 1. Check if exchange API is configured (DATA_SOURCE env var)
 * 2. Try exchange API first (better data quality)
 * 3. Catch errors and fall back to existing APIs (Finnhub/FRED)
 * 4. This provides graceful degradation
 * 
 * Benefits:
 * - Professional-grade data from exchanges
 * - Automatic fallback if exchange API fails
 * - No breaking changes to existing code
 * - Easy to switch between data sources
 */

