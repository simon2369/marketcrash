import { NextResponse } from 'next/server';
import { getDowJonesData } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getDowJonesData();
    
    if (!data || data.value === undefined || data.value === null) {
      throw new Error('Invalid data received from getDowJonesData');
    }
    
    if (data.value === 0) {
      throw new Error('Dow Jones value is zero - API may have returned invalid data');
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching Dow Jones data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Dow Jones data';
    
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


