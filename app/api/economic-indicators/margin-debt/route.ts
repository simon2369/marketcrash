import { NextResponse } from 'next/server';
import { getMarginDebt } from '@/lib/api/economicIndicators';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const data = await getMarginDebt();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching Margin Debt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Margin Debt';
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        status: 'safe' as const,
        historicalAvg: 1.8,
        warningLevel: 2.5,
        dangerLevel: 3.0,
        timestamp: new Date().toISOString(),
        description: 'Margin Debt as % of GDP',
      },
      { status: 200 }
    );
  }
}

