import { NextResponse } from 'next/server';
import { getNasdaq100Data } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getNasdaq100Data();
    
    if (!data || data.value === undefined || data.value === null) {
      throw new Error('Invalid data received from getNasdaq100Data');
    }
    
    if (data.value === 0) {
      throw new Error('Nasdaq 100 value is zero - API may have returned invalid data');
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching Nasdaq 100 data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Nasdaq 100 data';
    
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


