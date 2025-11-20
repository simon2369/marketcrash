import { NextResponse } from 'next/server';
import { getStockData } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> | { symbol: string } }
) {
  try {
    // Handle both Next.js 15+ (async params) and older versions (sync params)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { symbol } = resolvedParams;
    
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }
    
    console.log(`Fetching stock data for: ${symbol}`);
    const data = await getStockData(symbol);
    
    if (!data || data.value === undefined || data.value === null) {
      throw new Error(`Invalid data received for ${symbol}: missing value`);
    }
    
    // Allow 0 values (though unlikely for stocks) - let the frontend handle display
    console.log(`Stock data received for ${symbol}:`, { value: data.value, changePercent: data.changePercent });
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    const symbol = params instanceof Promise ? (await params).symbol : params.symbol;
    console.error(`Error fetching stock data for ${symbol}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        change: 0,
        changePercent: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

