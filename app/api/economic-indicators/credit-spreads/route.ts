import { NextResponse } from 'next/server';
import { getCreditSpreads } from '@/lib/api/economicIndicators';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const data = await getCreditSpreads();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching Credit Spreads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Credit Spreads';
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        status: 'safe' as const,
        historicalAvg: 4.0,
        warningLevel: 5.0,
        dangerLevel: 7.0,
        timestamp: new Date().toISOString(),
        description: 'ICE BofA High Yield Option-Adjusted Spread',
      },
      { status: 200 }
    );
  }
}

