import { NextResponse } from 'next/server';
import { getYieldCurveSpread } from '@/lib/api/economicIndicators';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const data = await getYieldCurveSpread();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching Yield Curve:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Yield Curve';
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        status: 'safe' as const,
        historicalAvg: 1.5,
        warningLevel: 0.5,
        dangerLevel: 0,
        timestamp: new Date().toISOString(),
        description: '10-Year minus 3-Month Treasury Spread',
      },
      { status: 200 }
    );
  }
}

