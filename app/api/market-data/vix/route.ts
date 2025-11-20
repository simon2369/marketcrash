import { NextResponse } from 'next/server';
import { getVIXData } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getVIXData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching VIX data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch VIX data';
    // Return 200 with error in body instead of 500 to prevent app crash
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



