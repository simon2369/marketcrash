import { NextResponse } from 'next/server';
import { getBuffettIndicator } from '@/lib/api/economicIndicators';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const data = await getBuffettIndicator();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching Buffett Indicator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Buffett Indicator';
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        status: 'safe' as const,
        historicalAvg: 80,
        warningLevel: 115,
        dangerLevel: 160,
        timestamp: new Date().toISOString(),
        description: 'Market Cap / GDP Ratio',
      },
      { status: 200 }
    );
  }
}

