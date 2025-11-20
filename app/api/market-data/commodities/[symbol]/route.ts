import { NextResponse } from 'next/server';
import { getCommodityData } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const data = await getCommodityData(symbol.toUpperCase());
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error(`Error fetching ${symbol} data:`, error);
    const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${symbol} data`;
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        change: 0,
        changePercent: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

