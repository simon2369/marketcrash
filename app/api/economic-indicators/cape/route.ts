import { NextResponse } from 'next/server';
import { getCAPERatio } from '@/lib/api/economicIndicators';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const data = await getCAPERatio();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching CAPE Ratio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch CAPE Ratio';
    // Return 200 with error in body to prevent app crash
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        status: 'safe' as const,
        historicalAvg: 16.8,
        warningLevel: 25,
        dangerLevel: 30,
        timestamp: new Date().toISOString(),
        description: 'Shiller P/E - Cyclically Adjusted Price-to-Earnings',
      },
      { status: 200 }
    );
  }
}

